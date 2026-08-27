import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function History({ 
  accessToken, 
  triggerModal, 
  refetchPlaylists, 
  isExecuting, 
  setIsExecuting, 
  progress, 
  setProgress,
  simulatorMode
}) {
  const [backup, setBackup] = useState(null);

  useEffect(() => {
    const rawBackup = localStorage.getItem('lastSortBackup');
    if (rawBackup) {
      setBackup(JSON.parse(rawBackup));
    }
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleRevert = async () => {
    if (!accessToken || !backup) return;

    const listNames = backup.createdPlaylists.map(p => p.title).join(", ");
    
    // Unified Modal Confirmation 1
    triggerModal({
      title: "Confirm Action Revert",
      message: `⚠️ CAUTION: Are you absolutely sure you want to revert?\n\nThis will permanently DELETE the following Master Playlists from your YouTube account:\n[ ${listNames} ]\n\nAnd it will re-create your original playlists and restore your videos.\n\nThis action cannot be undone.`,
      type: "confirm",
      confirmText: "Proceed to Step 2",
      onConfirm: () => {
        // Unified Modal Confirmation 2 (Double Check)
        triggerModal({
          title: "Double Check",
          message: "⚠️ DOUBLE CHECK: Are you 100% sure?\n\nThis is a destructive action (Master Playlists will be deleted, original playlists will be re-created).",
          type: "confirm",
          confirmText: "Revert & Restore",
          onConfirm: () => {
            executeRevert();
          }
        });
      }
    });
  };

  const executeRevert = async () => {
    setIsExecuting(true);
    setProgress("Starting revert process...");

    try {
      let failedRestoreCount = 0;
      // 1. Delete created Master Playlists
      for (const created of backup.createdPlaylists) {
        setProgress(`Deleting Master Playlist: "${created.title}"...`);
        if (simulatorMode) {
          await sleep(400);
        } else {
          await fetch(`https://www.googleapis.com/youtube/v3/playlists?id=${created.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
        await sleep(300); 
      }

      // 2. Re-create original playlists and restore videos
      if (backup.restorationData) {
        for (const orig of backup.restorationData) {
          setProgress(`Re-creating original playlist: "${orig.title}"...`);
          
          let newPlaylistId = "";
          try {
            if (simulatorMode) {
              await sleep(400);
              newPlaylistId = "mock_restored_" + Math.random().toString(36).substr(2, 9);
            } else {
              const createRes = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  snippet: { title: orig.title, description: 'Restored from Backup' },
                  status: { privacyStatus: 'private' }
                })
              });
              const createdData = await createRes.json();
              newPlaylistId = createdData.id;
            }
          } catch (e) {
            console.error(`Failed to re-create playlist "${orig.title}":`, e);
            continue; 
          }

          if (newPlaylistId && orig.videoIds && orig.videoIds.length > 0) {
            setProgress(`Restoring ${orig.videoIds.length} videos to "${orig.title}"...`);
            for (const videoId of orig.videoIds) {
              if (simulatorMode) {
                await sleep(150);
              } else {
                const postRes = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    snippet: {
                      playlistId: newPlaylistId,
                      resourceId: { kind: 'youtube#video', videoId: videoId }
                    }
                  })
                });
                if (!postRes.ok) {
                  failedRestoreCount++;
                  const errData = await postRes.json();
                  console.warn(`Failed to restore video ${videoId} to playlist "${orig.title}":`, errData.error?.message || errData);
                }
                await sleep(500);
              }
            }
          }
        }
      }

      setProgress("Revert complete! All changes have been rolled back.");
      refetchPlaylists();

      const messageText = failedRestoreCount > 0
        ? `Successfully reverted all changes, but ${failedRestoreCount} videos could not be added back (they may be private or deleted on YouTube). Original playlists have been re-created.`
        : "Successfully reverted all changes. Original playlists have been re-created and videos restored.";

      triggerModal({
        title: failedRestoreCount > 0 ? "Revert Completed with Warnings" : "Success",
        message: messageText,
        type: "alert"
      });
      localStorage.removeItem('lastSortBackup');
      setBackup(null);
    } catch (error) {
      console.error("Error during revert:", error);
      triggerModal({
        title: "Error",
        message: "An error occurred during revert. Check console.",
        type: "alert"
      });
    }

    setIsExecuting(false);
    setProgress("");
  };

  return (
    <div>
      <h1 className="tools-title" style={{ marginBottom: '24px' }}>History (Backup)</h1>
      <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '24px' }}>
        Review your past auto-sort executions. If a playlist was accidentally sorted, you can revert the changes here.
      </p>

      {progress && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
          {progress}
        </div>
      )}

      {!accessToken ? (
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--yt-spec-text-primary)', marginBottom: '8px' }}>Google Account Connection Required</h3>
          <p style={{ color: 'var(--yt-spec-text-secondary)' }}>You must click "Sign in with Google" at the top right to access backup operations.</p>
        </div>
      ) : !backup ? (
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px', textAlign: 'center', color: 'var(--yt-spec-text-secondary)' }}>
          No recent backups found. Backups are created automatically when you click "EXECUTE MASTER SORT" on the dashboard.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', padding: '24px', borderRadius: '8px', border: '1px solid var(--yt-spec-border-color)' }}>
          
          {/* CAUTION Warning Banner */}
          <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle color="#e74c3c" size={24} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#e74c3c' }}>Destructive Action Warning</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--yt-spec-text-secondary)' }}>
                Reverting this action will permanently delete the created Master Playlists. Make sure you want to proceed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--yt-spec-text-primary)' }}>Master Sort Execution</h3>
              <p style={{ margin: 0, color: 'var(--yt-spec-text-secondary)', fontSize: '14px' }}>
                Created {backup.createdPlaylists.length} master playlists: [ {backup.createdPlaylists.map(p => p.title).join(", ")} ]
              </p>
              <p style={{ margin: '4px 0 0 0', color: 'var(--yt-spec-text-secondary)', opacity: 0.8, fontSize: '12px' }}>
                Backed up {backup.restorationData.reduce((acc, curr) => acc + curr.videoIds.length, 0)} original videos.
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#e67e22', fontSize: '12px', fontWeight: 'bold' }}>Executed on: {backup.timestamp}</p>
              
              <div style={{ margin: '12px 0 0 0', borderTop: '1px solid var(--yt-spec-border-color)', paddingTop: '12px' }}>
                <p style={{ margin: '0 0 6px 0', color: 'var(--yt-spec-text-primary)', fontSize: '13px', fontWeight: 'bold' }}>
                  Original Playlists Backed Up:
                </p>
                <ul style={{ margin: '0 0 0 16px', padding: 0, color: 'var(--yt-spec-text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
                  {backup.restorationData.map(orig => (
                    <li key={orig.playlistId}>
                      <strong>{orig.title}</strong> ({orig.videoIds.length} videos)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              onClick={handleRevert}
              disabled={isExecuting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e67e22' }}
            >
              <RotateCcw size={18} />
              {isExecuting ? "Reverting..." : "Revert Action"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
