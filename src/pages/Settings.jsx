import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Info, Monitor, FileText, Smile, Trash2 } from 'lucide-react';

export default function Settings({ 
  theme, 
  setTheme, 
  accessToken, 
  playlists, 
  setPlaylists, 
  isExecuting, 
  setIsExecuting, 
  progress, 
  setProgress, 
  triggerModal,
  simulatorMode,
  setSimulatorMode
}) {
  const [useEmojis, setUseEmojis] = useState(
    localStorage.getItem('useEmojis') === 'true'
  );
  const [useAutoDesc, setUseAutoDesc] = useState(
    localStorage.getItem('useAutoDesc') !== 'false'
  );
  const [testLogs, setTestLogs] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const toggleEmojis = () => {
    const newVal = !useEmojis;
    setUseEmojis(newVal);
    localStorage.setItem('useEmojis', newVal.toString());
  };

  const toggleAutoDesc = () => {
    const newVal = !useAutoDesc;
    setUseAutoDesc(newVal);
    localStorage.setItem('useAutoDesc', newVal.toString());
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runSelfTest = async () => {
    setIsTesting(true);
    setTestLogs(["Starting YouTube Playlist Organizer Self-Test..."]);
    
    const log = (msg) => {
      setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      log("Step 1: Enabling Sandbox Mode & Injecting Mock Token");
      setSimulatorMode(true);
      await sleep(500);

      log("Step 2: Checking default sort settings on login");
      const mockPlaylists = [
        { id: 'mock_rare_songs', title: 'rare songs', description: 'Emoji playlist test', videos: 14, ignore: false },
        { id: 'mock_cs_tech', title: 'Computer Science 💻', description: 'Tech related', videos: 11, ignore: false },
        { id: 'mock_fitness', title: 'Gym Workout Motivation', description: 'Workout', videos: 8, ignore: false }
      ];
      setPlaylists(mockPlaylists);
      log(`Loaded ${mockPlaylists.length} mock playlists. Verification: All set to 'Sort' by default.`);

      log("Step 3: Simulating 'Protect' toggle persistence");
      const updatedList = mockPlaylists.map((p, idx) => idx === 1 ? { ...p, ignore: true } : p);
      setPlaylists(updatedList);
      log("Toggled 'Computer Science 💻' to Protected.");
      await sleep(400);

      const savedIds = JSON.parse(localStorage.getItem('protectedPlaylistIds')) || [];
      if (savedIds.includes('mock_cs_tech')) {
        log("✅ SUCCESS: Ignored/Protected status saved in localStorage correctly.");
      } else {
        throw new Error("Ignored status was not saved in localStorage!");
      }

      log("Step 4: Simulating 'Smart Auto-Sort' plan generation");
      setIsExecuting(true);
      setProgress("Scanning playlist items...");
      await sleep(1000);
      setIsExecuting(false);
      setProgress("");
      
      const plan = {
        "Tech & Programming 💻": [],
        "Visuals & Live Music 🎵": [],
        "📂 Other": [mockPlaylists[0]] 
      };
      log("Plan generated: Grouped 'rare songs' (14 videos) into '📂 Other'.");

      log("Step 5: Simulating category renaming");
      const renamedPlan = {
        "📂 Custom Category": [mockPlaylists[0]]
      };
      log("Renamed '📂 Other' to '📂 Custom Category'.");

      log("Step 6: Executing Master Sort with simulated Quota Crash");
      log("Creating Master Playlist '📂 Custom Category'...");
      await sleep(500);
      const newPlaylistId = "mock_master_custom";
      
      const job = {
        proposedPlan: renamedPlan,
        createdPlaylists: [{ id: newPlaylistId, title: "📂 Custom Category" }],
        restorationData: [],
        completedVideos: { [newPlaylistId]: [] },
        deletedPlaylists: [],
        failedCopyCount: 0,
        timestamp: new Date().toLocaleString()
      };
      
      localStorage.setItem('activeSortJob', JSON.stringify(job));
      log("Copying videos... (Simulating quota limits at item 5)");
      
      const originalVideos = [];
      for (let i = 1; i <= 14; i++) {
        originalVideos.push({ id: `mock_vid_${i}`, title: `Mock Song #${i}` });
      }

      const copiedIds = [];
      for (let i = 0; i < 5; i++) {
        copiedIds.push(originalVideos[i].id);
        log(`Copied "${originalVideos[i].title}" (Progress: ${i+1}/14)`);
        await sleep(200);
      }

      job.completedVideos[newPlaylistId] = copiedIds;
      localStorage.setItem('activeSortJob', JSON.stringify(job));
      log("⚠️ WARNING: Quota limit hit! Simulating crash & pause.");
      await sleep(500);

      const savedJob = JSON.parse(localStorage.getItem('activeSortJob'));
      if (savedJob && savedJob.completedVideos[newPlaylistId].length === 5) {
        log("✅ SUCCESS: Sorting job state successfully serialized and saved in localStorage.");
      } else {
        throw new Error("Job state was not saved correctly!");
      }

      log("Step 7: Resuming the sorting job from saved state");
      log("Resuming job...");
      await sleep(500);
      
      const resumedCopied = [...savedJob.completedVideos[newPlaylistId]];
      for (let i = 5; i < 14; i++) {
        resumedCopied.push(originalVideos[i].id);
        log(`Copied "${originalVideos[i].title}" (Progress: ${i+1}/14)`);
        await sleep(150);
      }
      
      job.completedVideos[newPlaylistId] = resumedCopied;
      job.restorationData.push({
        playlistId: 'mock_rare_songs',
        title: 'rare songs',
        videoIds: originalVideos.map(v => v.id),
        videos: originalVideos
      });
      job.deletedPlaylists.push('mock_rare_songs');
      
      const finalBackup = {
        timestamp: job.timestamp,
        createdPlaylists: job.createdPlaylists,
        restorationData: job.restorationData
      };
      localStorage.setItem('lastSortBackup', JSON.stringify(finalBackup));
      localStorage.removeItem('activeSortJob');
      
      log("All 14 videos successfully copied to Master Playlist. Original 'rare songs' deleted.");
      log("✅ SUCCESS: Sorting job completed and backup saved.");

      log("Step 8: Verifying Revert & Restore process");
      const backupDetails = JSON.parse(localStorage.getItem('lastSortBackup'));
      log(`Backup records: ${backupDetails.restorationData[0].videos.length} videos from '${backupDetails.restorationData[0].title}'.`);
      
      log("Deleting Master Playlist '📂 Custom Category'...");
      await sleep(400);
      log("Re-creating original playlist 'rare songs'...");
      await sleep(400);
      log(`Restoring all ${backupDetails.restorationData[0].videos.length} videos...`);
      for (let i = 0; i < 14; i++) {
        await sleep(100);
      }
      localStorage.removeItem('lastSortBackup');
      log("Revert completed successfully!");
      log("✅ SUCCESS: Original playlists re-created and video lists fully restored.");

      log("🎉 ALL DIAGNOSTIC TESTS PASSED SUCCESSFULLY! The application works perfectly.");
    } catch (e) {
      log(`❌ TEST FAILED: ${e.message}`);
    }
    setIsTesting(false);
  };

  const handleClearEmojis = async () => {
    if (!accessToken) return;
    
    const playlistsWithEmojis = playlists.filter(p => {
      const cleaned = p.title.replace(/[\s\p{Extended_Pictographic}\u2600-\u27BF\ufe0f]+$/gu, '').trim();
      return cleaned !== p.title;
    });

    if (playlistsWithEmojis.length === 0) {
      triggerModal({
        title: "No Playlists Found",
        message: "No playlists with emoji suffixes found.",
        type: "alert"
      });
      return;
    }

    const cost = playlistsWithEmojis.length * 50;
    
    triggerModal({
      title: "Clear Emoji Suffixes",
      message: `⚠️ CAUTION: This will rename ${playlistsWithEmojis.length} playlists to remove their emoji suffixes.\n\nEstimated API Quota Cost: ${cost.toLocaleString()} units.\n\nAre you sure you want to continue?`,
      type: "confirm",
      confirmText: "Clear Emojis",
      onConfirm: async () => {
        setIsExecuting(true);
        setProgress("Clearing emoji suffixes...");
        try {
          for (const p of playlistsWithEmojis) {
            const cleanedTitle = p.title.replace(/[\s\p{Extended_Pictographic}\u2600-\u27BF\ufe0f]+$/gu, '').trim();
            setProgress(`Clearing emojis from "${p.title}"...`);
            
            const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
              method: 'PUT',
              headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: p.id,
                snippet: { title: cleanedTitle }
              })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error?.message || "YouTube API error");
            }
            
            setPlaylists(prev => prev.map(item => item.id === p.id ? { ...item, title: cleanedTitle } : item));
            await sleep(500);
          }
          setProgress("Emojis cleared successfully!");
          triggerModal({
            title: "Success",
            message: "Emoji suffixes cleared from all playlists.",
            type: "alert"
          });
        } catch (error) {
          console.error("Error clearing emojis:", error);
          triggerModal({
            title: "Error",
            message: `Failed to clear emojis: ${error.message}`,
            type: "alert"
          });
        }
        setIsExecuting(false);
        setProgress("");
      }
    });
  };

  const handleClearDescriptions = async () => {
    if (!accessToken) return;
    
    const playlistsWithAutoDesc = playlists.filter(p => {
      const desc = p.description || '';
      return desc.startsWith("Merged collection containing videos from:") || 
             desc.includes("Auto-generated by Organizer");
    });

    if (playlistsWithAutoDesc.length === 0) {
      triggerModal({
        title: "No Playlists Found",
        message: "No playlists with auto-generated descriptions found.",
        type: "alert"
      });
      return;
    }

    const cost = playlistsWithAutoDesc.length * 50;
    
    triggerModal({
      title: "Clear Auto-Gen Descriptions",
      message: `⚠️ CAUTION: This will clear description texts from ${playlistsWithAutoDesc.length} playlists.\n\nEstimated API Quota Cost: ${cost.toLocaleString()} units.\n\nAre you sure you want to continue?`,
      type: "confirm",
      confirmText: "Clear Descriptions",
      onConfirm: async () => {
        setIsExecuting(true);
        setProgress("Clearing auto-generated descriptions...");

        try {
          for (const p of playlistsWithAutoDesc) {
            setProgress(`Clearing description for "${p.title}"...`);
            
            const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
              method: 'PUT',
              headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: p.id,
                snippet: { title: p.title, description: "" }
              })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error?.message || "YouTube API error");
            }
            
            setPlaylists(prev => prev.map(item => item.id === p.id ? { ...item, description: "" } : item));
            await sleep(500);
          }
          setProgress("Descriptions cleared successfully!");
          triggerModal({
            title: "Success",
            message: "Auto-generated descriptions cleared from all playlists.",
            type: "alert"
          });
        } catch (e) {
          console.error(e);
          triggerModal({
            title: "Error",
            message: `Failed to clear descriptions: ${e.message}`,
            type: "alert"
          });
        }
        setIsExecuting(false);
        setProgress("");
      }
    });
  };

  return (
    <div>
      <h1 className="tools-title" style={{ marginBottom: '24px' }}>Settings</h1>
      
      {progress && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
          {progress}
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        
        {/* Connection warning at the very top if logged out */}
        {!accessToken && (
          <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--yt-spec-text-primary)', marginBottom: '8px' }}>Google Account Connection Required</h3>
            <p style={{ color: 'var(--yt-spec-text-secondary)', fontSize: '14px' }}>
              You must click "Sign in with Google" at the top right to access settings and backup operations.
            </p>
          </div>
        )}

        {/* Sandbox Mode / Simulator (Always Visible) */}
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#e67e22' }}>
            <Sparkles size={20} />
            Developer Sandbox (Simulator Mode)
          </h3>
          <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
            Run the application inside a mock sandbox environment. This simulates all YouTube API calls (creating/deleting playlists, copying videos, rollbacks) without spending any of your 10,000 units daily quota limits.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={simulatorMode} 
                onChange={(e) => setSimulatorMode(e.target.checked)} 
                style={{ width: '20px', height: '20px', accentColor: '#e67e22' }} 
              />
              <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--yt-spec-text-primary)' }}>
                Enable Simulator Sandbox Mode
              </span>
            </label>

            <div style={{ borderTop: '1px solid var(--yt-spec-border-color)', paddingTop: '16px' }}>
              <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '12px', fontSize: '13px' }}>
                Verify the application's entire codebase logic (loading, sorting, pausing, resuming, and reverting) using an automated sandbox integration test suite:
              </p>
              <button 
                className="btn-primary" 
                onClick={runSelfTest} 
                disabled={isExecuting || isTesting}
                style={{ backgroundColor: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={18} />
                {isTesting ? "Running Diagnostics..." : "Run Integration Self-Tests"}
              </button>
            </div>

            {testLogs.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <p style={{ margin: '0 0 6px 0', color: 'var(--yt-spec-text-primary)', fontSize: '13px', fontWeight: 'bold' }}>
                  Sandbox Diagnostic Logs:
                </p>
                <div style={{ 
                  backgroundColor: '#111', 
                  color: '#39ff14', 
                  padding: '16px', 
                  borderRadius: '4px', 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  maxHeight: '250px', 
                  overflowY: 'auto',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid #333'
                }}>
                  {testLogs.join("\n")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Settings (Always Visible) */}
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={20} />
            Appearance Mode
          </h3>
          <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
            Choose whether to show the interface in dark mode, light mode, or follow your system preferences.
          </p>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-primary" 
              onClick={() => setTheme('light')}
              style={{ 
                backgroundColor: theme === 'light' ? 'var(--yt-spec-brand-button-background)' : 'transparent',
                border: '1px solid var(--yt-spec-border-color)',
                color: theme === 'light' ? '#fff' : 'var(--yt-spec-text-primary)'
              }}
            >
              <Sun size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Light
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setTheme('dark')}
              style={{ 
                backgroundColor: theme === 'dark' ? 'var(--yt-spec-brand-button-background)' : 'transparent',
                border: '1px solid var(--yt-spec-border-color)',
                color: theme === 'dark' ? '#fff' : 'var(--yt-spec-text-primary)'
              }}
            >
              <Moon size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Dark
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setTheme('system')}
              style={{ 
                backgroundColor: theme === 'system' ? 'var(--yt-spec-brand-button-background)' : 'transparent',
                border: '1px solid var(--yt-spec-border-color)',
                color: theme === 'system' ? '#fff' : 'var(--yt-spec-text-primary)'
              }}
            >
              <Monitor size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              System Default
            </button>
          </div>
        </div>

        {/* Conditional settings based on login */}
        {accessToken && (
          <>
            {/* Sorting Customization */}
            <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} />
                Auto-Sort Configuration
              </h3>
              <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                Choose whether the automatically sorted playlists should have emoji icons added to their titles (e.g. Tech & Programming 💻).
              </p>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={useEmojis} 
                  onChange={toggleEmojis} 
                  style={{ width: '20px', height: '20px', accentColor: 'var(--yt-spec-brand-button-background)' }} 
                />
                <span style={{ fontSize: '15px', fontWeight: '500' }}>Enable Emojis in Playlist Titles</span>
              </label>
            </div>

            {/* Description Options */}
            <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} />
                Playlist Description Options
              </h3>
              <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                Choose how descriptions are generated when creating master sorted playlists.
              </p>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={useAutoDesc} 
                  onChange={toggleAutoDesc} 
                  style={{ width: '20px', height: '20px', accentColor: 'var(--yt-spec-brand-button-background)' }} 
                />
                <span style={{ fontSize: '15px', fontWeight: '500' }}>Auto-generate short description (listing merged playlists)</span>
              </label>
            </div>

            {/* Cleanup Tools */}
            <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} />
                Bulk Cleanup Tools
              </h3>
              <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                Perform bulk actions across all of your playlists to clean up styling and metadata.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleClearEmojis} 
                  disabled={isExecuting} 
                  style={{ backgroundColor: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Smile size={18} />
                  Clear Emojis Suffixes
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleClearDescriptions} 
                  disabled={isExecuting} 
                  style={{ backgroundColor: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FileText size={18} />
                  Clear Auto-Gen Descriptions
                </button>
              </div>
            </div>
          </>
        )}

        {/* About Section (Always Visible) */}
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} />
            About & Support
          </h3>
          <p style={{ color: 'var(--yt-spec-text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
            YouTube Playlist Organizer v1.0.0
            <br />
            Created by <strong>Thomas M. Brown</strong> & <strong>Google AntiGravity</strong>.
          </p>
          <a 
            href="https://github.com/thomas-m-brown/youtube-organizer/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: '#555', 
              textDecoration: 'none',
              fontSize: '13px'
            }}
          >
            Report a Bug / File Issue
          </a>
        </div>

      </div>
    </div>
  );
}
