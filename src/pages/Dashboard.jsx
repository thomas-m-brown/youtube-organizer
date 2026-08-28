import React, { useState, useEffect, useRef } from 'react';
import { PlaySquare, Shield, AlertTriangle, Wand2, Info, Check, Plus, MoreVertical, Trash2, Edit2, Image, Upload } from 'lucide-react';

const CATEGORY_MAP = {
  "Tech & Programming 💻": ["Computer SCience", "AI", "Hermes", "Websites", "Technology", "MacBook neo"],
  "Mindset & Philosophy 🧠": ["Mental", "Brain", "Life lessons", "System Stuff", "Public Lies"],
  "The Grind 🔥": ["Grind", "Motivation", "Pep talks", "Money"],
  "DIY & Home Construction 🔨": ["House work", "Home Ideas", "Pathway", "CAD", "Engineering"],
  "Learning & Education 📚": ["Study", "School", "what to learn", "Science", "English", "Manners"],
  "Fitness & Health 🏋️": ["Fitness & Health"],
  "Hobbies & Gaming 🎣": ["Fishing", "Golf golf", "CS", "Guitar To PC"],
  "Entertainment & Comedy 🎭": ["Funny", "brain rot", "creepy"],
  "Visuals & Live Music 🎵": ["trippy", "Live!"]
};

export default function Dashboard({ 
  accessToken, 
  playlists, 
  setPlaylists, 
  loading, 
  isExecuting, 
  setIsExecuting, 
  progress, 
  setProgress,
  triggerModal,
  searchQuery,
  refetchPlaylists
}) {
  const [proposedPlan, setProposedPlan] = useState(null);
  const [quotaCost, setQuotaCost] = useState(0);
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    const job = localStorage.getItem('activeSortJob');
    if (job) {
      setActiveJob(JSON.parse(job));
    } else {
      setActiveJob(null);
    }
  }, [isExecuting]);

  const resumeActiveJob = () => {
    if (activeJob) {
      executeMasterSort(activeJob);
    }
  };

  const discardActiveJob = () => {
    triggerModal({
      title: "Discard Job?",
      message: "Are you sure you want to discard this interrupted sorting job? Any master playlists already created will NOT be deleted automatically.",
      type: "confirm",
      confirmText: "Discard",
      onConfirm: () => {
        localStorage.removeItem('activeSortJob');
        setActiveJob(null);
      }
    });
  };
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [sortBy, setSortBy] = useState("alphabetical-asc");
  const [activeThumbnailPlaylist, setActiveThumbnailPlaylist] = useState(null);
  const [videoInputVal, setVideoInputVal] = useState("");
  const [uploadingPlaylistId, setUploadingPlaylistId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleIgnore = (id, shouldIgnore) => {
    setPlaylists(playlists.map(p => p.id === id ? { ...p, ignore: shouldIgnore } : p));
    setProposedPlan(null);
  };

  const getCleanCategoryName = (name) => {
    const useEmojis = localStorage.getItem('useEmojis') === 'true';
    if (useEmojis) return name;
    return name.replace(/[\s\p{Extended_Pictographic}\u2600-\u27BF\ufe0f]+$/gu, '').trim();
  };
  // Smart scan that also loads video names/thumbnails
  const generateAutoSortPlan = async () => {
    if (!accessToken) return;
    setIsExecuting(true);
    setProgress("Scanning videos inside your playlists for merge preview...");

    try {
      // Load video previews for active playlists
      const playlistsWithVideos = await Promise.all(
        playlists.map(async (p) => {
          if (p.ignore || p.videoItems) return p; // Skip ignored or already loaded
          
          try {
            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${p.id}&maxResults=50`,
              { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
            );
            const data = await response.json();
            const videoItems = data.items ? data.items.map(item => ({
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.default?.url || ''
            })) : [];
            return { ...p, videoItems };
          } catch (e) {
            console.error(`Error loading videos for playlist ${p.title}:`, e);
            return { ...p, videoItems: [] };
          }
        })
      );

      setPlaylists(playlistsWithVideos);

      const plan = {
        "Tech & Programming 💻": [],
        "Mindset & Philosophy 🧠": [],
        "The Grind 🔥": [],
        "DIY & Home Construction 🔨": [],
        "Learning & Education 📚": [],
        "Fitness & Health 🏋️": [],
        "Hobbies & Gaming 🎣": [],
        "Entertainment & Comedy 🎭": [],
        "Visuals & Live Music 🎵": [],
        "📂 Other": []
      };

      playlistsWithVideos.forEach(p => {
        if (p.ignore) return;
        const lower = p.title.toLowerCase();
        
        if (/(tech|computer|ai|hermes|website|macbook|code)/.test(lower)) plan["Tech & Programming 💻"].push(p);
        else if (/(mental|brain|life|system|lies|philosophy|mind)/.test(lower)) plan["Mindset & Philosophy 🧠"].push(p);
        else if (/(grind|motivation|pep|money|finance|success)/.test(lower)) plan["The Grind 🔥"].push(p);
        else if (/(house|home|pathway|cad|engineering|diy|build)/.test(lower)) plan["DIY & Home Construction 🔨"].push(p);
        else if (/(study|school|learn|science|english|manners|education)/.test(lower)) plan["Learning & Education 📚"].push(p);
        else if (/(fit|health|workout)/.test(lower)) plan["Fitness & Health 🏋️"].push(p);
        else if (/(fish|golf|cs|guitar|game|hobby)/.test(lower)) plan["Hobbies & Gaming 🎣"].push(p);
        else if (/(funny|rot|creepy|comedy)/.test(lower)) plan["Entertainment & Comedy 🎭"].push(p);
        else if (/(trippy|live|music|visual)/.test(lower)) plan["Visuals & Live Music 🎵"].push(p);
        else plan["📂 Other"].push(p);
      });

      Object.keys(plan).forEach(k => { if (plan[k].length === 0) delete plan[k]; });
      
      let totalVideos = 0;
      Object.values(plan).forEach(arr => {
        arr.forEach(p => { totalVideos += p.videos; });
      });
      const cost = (Object.keys(plan).length * 50) + (totalVideos * 50);
      setQuotaCost(cost);
      setProposedPlan(plan);
    } catch (error) {
      console.error("Error generating auto-sort plan:", error);
    }
    
    setIsExecuting(false);
    setProgress("");
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const cleanProposedPlanForSerialization = (plan) => {
    const cleaned = {};
    for (const [category, playlists] of Object.entries(plan)) {
      cleaned[category] = playlists.map(p => ({
        id: p.id,
        title: p.title,
        videos: p.videos
      }));
    }
    return cleaned;
  };

  const executeMasterSort = async (resumeJob = null) => {
    const runSort = async () => {
      setIsExecuting(true);
      const useAutoDesc = localStorage.getItem('useAutoDesc') !== 'false';
      
      let job;
      if (resumeJob) {
        job = { ...resumeJob };
      } else {
        job = {
          proposedPlan: cleanProposedPlanForSerialization(proposedPlan),
          createdPlaylists: [],
          restorationData: [],
          completedVideos: {},
          deletedPlaylists: [],
          failedCopyCount: 0,
          timestamp: new Date().toLocaleString()
        };
      }

      localStorage.setItem('activeSortJob', JSON.stringify(job));

      try {
        const planEntries = Object.entries(job.proposedPlan);

        for (let catIdx = 0; catIdx < planEntries.length; catIdx++) {
          const [newCategory, oldPlaylists] = planEntries[catIdx];
          const cleanName = getCleanCategoryName(newCategory);

          let masterPlaylist = job.createdPlaylists.find(p => p.title === cleanName);
          let newPlaylistId = masterPlaylist?.id;

          if (!newPlaylistId) {
            setProgress(`Creating Master Playlist: ${cleanName}...`);
            let desc = '';
            if (useAutoDesc) {
              desc = `Merged collection containing videos from: ${oldPlaylists.map(p => p.title).join(', ')}`;
            }
            const createRes = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
              method: 'POST',
              headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                snippet: { title: cleanName, description: desc },
                status: { privacyStatus: 'private' }
              })
            });
            const createdPlaylist = await createRes.json();
            newPlaylistId = createdPlaylist.id;

            job.createdPlaylists.push({ id: newPlaylistId, title: cleanName });
            job.completedVideos[newPlaylistId] = [];
            localStorage.setItem('activeSortJob', JSON.stringify(job));
          }

          for (const old of oldPlaylists) {
            if (job.deletedPlaylists.includes(old.id)) {
              continue; 
            }

            setProgress(`Copying videos from "${old.title}" into "${cleanName}"...`);
            
            let originalVideos = [];
            const copiedIds = job.completedVideos[newPlaylistId] || [];

            const savedRestoration = job.restorationData.find(r => r.playlistId === old.id);
            if (savedRestoration) {
              originalVideos = savedRestoration.videos || [];
            } else {
              let pageToken = '';
              do {
                const itemsRes = await fetch(
                  `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${old.id}&maxResults=50${pageToken ? '&pageToken=' + pageToken : ''}`,
                  { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const itemsData = await itemsRes.json();
                if (itemsData.items) {
                  for (const item of itemsData.items) {
                    originalVideos.push({
                      id: item.snippet.resourceId.videoId,
                      title: item.snippet.title || 'Unknown Video'
                    });
                  }
                }
                pageToken = itemsData.nextPageToken;
              } while (pageToken);
            }

            for (let vIdx = 0; vIdx < originalVideos.length; vIdx++) {
              const video = originalVideos[vIdx];
              
              if (copiedIds.includes(video.id)) {
                continue; 
              }

              setProgress(`Copying "${video.title}" to "${cleanName}" (${vIdx + 1}/${originalVideos.length})...`);
              
              const postRes = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  snippet: {
                    playlistId: newPlaylistId,
                    resourceId: { kind: 'youtube#video', videoId: video.id }
                  }
                })
              });
              if (!postRes.ok) {
                job.failedCopyCount++;
                const errData = await postRes.json();
                console.warn(`Failed to copy video ${video.id} from "${old.title}":`, errData.error?.message || errData);
                
                if (postRes.status === 403 || errData.error?.message?.includes("quota")) {
                  throw new Error("YouTube API daily quota exceeded. You can resume this sorting job tomorrow.");
                }
              }

              copiedIds.push(video.id);
              job.completedVideos[newPlaylistId] = copiedIds;
              localStorage.setItem('activeSortJob', JSON.stringify(job));
            }

            if (!job.restorationData.some(r => r.playlistId === old.id)) {
              job.restorationData.push({
                playlistId: old.id,
                title: old.title,
                videoIds: originalVideos.map(v => v.id),
                videos: originalVideos
              });
              localStorage.setItem('activeSortJob', JSON.stringify(job));
            }

            await fetch(`https://www.googleapis.com/youtube/v3/playlists?id=${old.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            job.deletedPlaylists.push(old.id);
            localStorage.setItem('activeSortJob', JSON.stringify(job));
            await sleep(300);
          }
        }

        const backupDetails = {
          timestamp: job.timestamp,
          createdPlaylists: job.createdPlaylists,
          restorationData: job.restorationData
        };
        localStorage.setItem('lastSortBackup', JSON.stringify(backupDetails));
        localStorage.removeItem('activeSortJob'); 

        setProgress("Done! All playlists merged successfully.");
        refetchPlaylists();

        const messageText = job.failedCopyCount > 0 
          ? `Reorganization completed successfully, but ${job.failedCopyCount} videos could not be copied (they may be private or deleted on YouTube). The original playlists have been merged and deleted.`
          : "Reorganization has completed successfully. The original playlists were merged and deleted. Verify the results on YouTube or check History (Backup) to undo.";

        triggerModal({
          title: job.failedCopyCount > 0 ? "Sort Completed with Warnings" : "Sort Complete",
          message: messageText,
          type: "alert"
        });
        setProposedPlan(null);
      } catch (error) {
        console.error("Sorting execution interrupted:", error);
        triggerModal({
          title: "Execution Paused",
          message: `The sorting job was interrupted: ${error.message}\n\nYour progress has been saved. You can safely resume tomorrow or anytime from the Dashboard.`,
          type: "alert"
        });
      }
      setIsExecuting(false);
      setProgress("");
    };

    if (resumeJob) {
      runSort();
    } else {
      triggerModal({
        title: "Confirm Reorganization",
        message: `Are you sure you want to execute? This will create ${Object.keys(proposedPlan).length} master playlists.\n\nEstimated API Quota Cost: ${quotaCost.toLocaleString()} units.`,
        type: "confirm",
        confirmText: "Execute Sort",
        onConfirm: runSort
      });
    }
  };

  const handleCreatePlaylist = async () => {
    if (!accessToken) return;

    triggerModal({
      title: "Create New Playlist",
      message: "Enter a title for the new playlist:",
      type: "prompt",
      placeholder: "New Playlist Title",
      onConfirm: async (name) => {
        if (!name) return;
        setProgress(`Creating playlist "${name}"...`);
        try {
          const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              snippet: { title: name, description: 'Created via Organizer' },
              status: { privacyStatus: 'private' }
            })
          });
          const data = await response.json();
          if (data.id) {
            const newPlaylist = {
              id: data.id,
              title: name,
              videos: 0,
              thumbnail: '',
              ignore: false,
              publishedAt: new Date().toISOString()
            };
            setPlaylists(prev => [newPlaylist, ...prev]);
            setProgress("Playlist created successfully!");
          }
        } catch (e) {
          console.error("Error creating playlist:", e);
          triggerModal({
            title: "Error",
            message: "Failed to create playlist.",
            type: "alert"
          });
        }
        setTimeout(() => setProgress(""), 3000);
      }
    });
  };

  const handleRenamePlaylist = async (playlist) => {
    if (!accessToken) return;

    triggerModal({
      title: "Rename Playlist",
      message: `Enter the new name for "${playlist.title}":`,
      type: "prompt",
      defaultValue: playlist.title,
      placeholder: playlist.title,
      onConfirm: async (newName) => {
        if (!newName || newName === playlist.title) return;
        setProgress(`Renaming playlist to "${newName}"...`);
        try {
          const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: playlist.id,
              snippet: { title: newName }
            })
          });
          if (response.ok) {
            setPlaylists(prev => prev.map(p => p.id === playlist.id ? { ...p, title: newName } : p));
            setProgress("Playlist renamed successfully!");
          } else {
            const err = await response.json();
            throw new Error(err.error?.message || "YouTube API error");
          }
        } catch (e) {
          console.error("Error renaming playlist:", e);
          triggerModal({
            title: "Rename Failed",
            message: `Failed to rename playlist: ${e.message}`,
            type: "alert"
          });
        }
        setTimeout(() => setProgress(""), 3000);
      }
    });
  };

  const handleDeletePlaylist = async (playlist) => {
    if (!accessToken) return;

    triggerModal({
      title: "Confirm Deletion",
      message: `⚠️ WARNING: Are you absolutely sure you want to permanently delete "${playlist.title}" from your YouTube account?\n\nThis cannot be undone.`,
      type: "confirm",
      confirmText: "Permanently Delete",
      onConfirm: async () => {
        setProgress(`Deleting playlist "${playlist.title}"...`);
        try {
          const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?id=${playlist.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.ok) {
            setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
            setProgress("Playlist deleted successfully!");
          } else {
            const err = await response.json();
            throw new Error(err.error?.message || "YouTube API error");
          }
        } catch (e) {
          console.error("Error deleting playlist:", e);
          triggerModal({
            title: "Delete Failed",
            message: `Failed to delete playlist: ${e.message}`,
            type: "alert"
          });
        }
        setTimeout(() => setProgress(""), 3000);
      }
    });
  };

  const handleSaveVideoCover = async () => {
    if (!accessToken || !activeThumbnailPlaylist || !videoInputVal) return;

    let videoId = videoInputVal.trim();
    const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoId.match(urlPattern);
    if (match) {
      videoId = match[1];
    }

    if (videoId.length !== 11) {
      triggerModal({
        title: "Invalid Input",
        message: "Invalid YouTube Video ID or URL. Make sure it is an 11-character video ID.",
        type: "alert"
      });
      return;
    }

    setProgress("Adding video to top of playlist for cover update...");
    const targetPlaylistId = activeThumbnailPlaylist.id;
    setActiveThumbnailPlaylist(null); 
    setVideoInputVal("");

    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snippet: {
            playlistId: targetPlaylistId,
            resourceId: { kind: 'youtube#video', videoId: videoId },
            position: 0
          }
        })
      });

      if (response.ok) {
        const newThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        setPlaylists(prev => prev.map(p => 
          p.id === targetPlaylistId 
            ? { ...p, thumbnail: newThumbnail, videos: p.videos + 1 } 
            : p
        ));
        setProgress("Playlist cover updated successfully!");
      } else {
        triggerModal({
          title: "Error",
          message: "Failed to add video. Make sure the video is public or unlisted.",
          type: "alert"
        });
      }
    } catch (e) {
      console.error("Error setting video cover:", e);
      triggerModal({
        title: "Error",
        message: "Failed to update cover thumbnail.",
        type: "alert"
      });
    }
    setTimeout(() => setProgress(""), 3000);
  };

  const triggerLocalUpload = (playlistId) => {
    setUploadingPlaylistId(playlistId);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 50);
  };

  const handleLocalFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingPlaylistId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setPlaylists(prev => prev.map(p => 
        p.id === uploadingPlaylistId ? { ...p, thumbnail: base64Data } : p
      ));
      setProgress("Custom local thumbnail applied successfully!");
      
      triggerModal({
        title: "Local Cover Applied",
        message: "Custom cover updated locally!\n\nNote: YouTube's API only allows setting video covers, so this custom upload is applied locally inside this app.",
        type: "alert"
      });
      setUploadingPlaylistId(null);
      setActiveThumbnailPlaylist(null); 
    };
    reader.readAsDataURL(file);
    e.target.value = null;
    setTimeout(() => setProgress(""), 3000);
  };

  const handleRenameProposedCategory = (oldName) => {
    triggerModal({
      title: "Rename Master Category",
      message: `Enter custom title for master playlist category:`,
      type: "prompt",
      defaultValue: oldName,
      placeholder: oldName,
      onConfirm: (newName) => {
        if (!newName || newName.trim() === oldName) return;
        setProposedPlan(prev => {
          const updated = {};
          Object.keys(prev).forEach(key => {
            if (key === oldName) {
              updated[newName.trim()] = prev[oldName];
            } else {
              updated[key] = prev[key];
            }
          });
          return updated;
        });
      }
    });
  };

  const openPlaylistOnYouTube = (id) => {
    window.open(`https://www.youtube.com/playlist?list=${id}`, '_blank');
  };

  const sortedPlaylists = [...playlists].sort((a, b) => {
    if (sortBy === 'alphabetical-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'alphabetical-desc') return b.title.localeCompare(a.title);
    if (sortBy === 'videos-desc') return b.videos - a.videos;
    if (sortBy === 'videos-asc') return a.videos - b.videos;
    if (sortBy === 'date-desc') return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    if (sortBy === 'date-asc') return new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0);
    return 0;
  });

  const displayedPlaylists = sortedPlaylists.filter(p => 
    p.title.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLocalFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* CUSTOM CHANGE COVER MODAL */}
      {activeThumbnailPlaylist && (
        <div className="modal-backdrop" onClick={() => { setActiveThumbnailPlaylist(null); setVideoInputVal(""); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px', color: 'var(--yt-spec-text-primary)' }}>Change Cover: {activeThumbnailPlaylist.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--yt-spec-text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Paste a YouTube Video URL or ID below to add that video to the top of the playlist (syncs to YouTube). Or upload a custom image from your device.
            </p>
            
            <input 
              type="text" 
              className="search-input" 
              placeholder="Paste YouTube Video URL or ID here..."
              value={videoInputVal}
              onChange={(e) => setVideoInputVal(e.target.value)}
              style={{ width: '100%', marginBottom: '20px', borderRadius: '4px', height: '36px' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={() => triggerLocalUpload(activeThumbnailPlaylist.id)}
                style={{ backgroundColor: '#2980b9', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} />
                Upload Local File
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => { setActiveThumbnailPlaylist(null); setVideoInputVal(""); }} 
                  style={{ backgroundColor: '#555' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveVideoCover} 
                  disabled={!videoInputVal}
                  style={{ backgroundColor: '#4caf50' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accessToken && (
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', borderLeft: '4px solid #f1c40f', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info color="#f1c40f" size={24} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--yt-spec-text-primary)' }}>YouTube API Quota Limit</h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--yt-spec-text-secondary)' }}>Google limits apps to 10,000 API units per day. Creating a playlist costs 50 units. Adding a video costs 50 units. We will calculate your usage before executing any sorting.</p>
          </div>
        </div>
      )}

      <div className="tools-bar">
        <h1 className="tools-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {accessToken && (
            <>
              {/* Hide Create Playlist button when proposed plan is visible */}
              {!proposedPlan && (
                <button className="btn-primary" onClick={handleCreatePlaylist} style={{ backgroundColor: '#2980b9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} />
                  Create Playlist
                </button>
              )}

              {!proposedPlan ? (
                 <>
                   <select 
                     value={sortBy} 
                     onChange={(e) => setSortBy(e.target.value)} 
                     style={{ 
                       backgroundColor: 'var(--yt-spec-menu-background)', 
                       border: '1px solid var(--yt-spec-border-color)', 
                       color: 'var(--yt-spec-text-primary)', 
                       padding: '8px 12px', 
                       borderRadius: '18px', 
                       fontSize: '14px',
                       cursor: 'pointer',
                       outline: 'none'
                     }}
                   >
                     <option value="alphabetical-asc">Sort: A-Z</option>
                     <option value="alphabetical-desc">Sort: Z-A</option>
                     <option value="videos-desc">Sort: Most Videos</option>
                     <option value="videos-asc">Sort: Least Videos</option>
                     <option value="date-desc">Sort: Newest Created</option>
                     <option value="date-asc">Sort: Oldest Created</option>
                   </select>

                   <button className="btn-primary" onClick={generateAutoSortPlan} disabled={loading || isExecuting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Wand2 size={18} />
                     {isExecuting ? "Scanning..." : "Smart Auto-Sort (Scan & Analyze)"}
                   </button>
                 </>
              ) : (
                <>
                  <button className="btn-primary" onClick={() => setProposedPlan(null)} disabled={isExecuting} style={{ backgroundColor: '#555' }}>Cancel Plan</button>
                  <button className="btn-primary" onClick={executeMasterSort} disabled={isExecuting} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#4caf50' }}>
                    <AlertTriangle size={18} />
                    {isExecuting ? "Executing..." : "EXECUTE MASTER SORT"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {activeJob && !isExecuting && (
        <div style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', borderLeft: '4px solid #e67e22', padding: '16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#e67e22' }}>Incomplete Sorting Job Found</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--yt-spec-text-secondary)' }}>
              A master sort job from {activeJob.timestamp} was interrupted. You can resume it to finish copying the remaining videos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-primary" 
              onClick={discardActiveJob}
              style={{ backgroundColor: '#555', fontSize: '13px', padding: '6px 12px' }}
            >
              Discard
            </button>
            <button 
              className="btn-primary" 
              onClick={resumeActiveJob}
              style={{ backgroundColor: '#e67e22', fontSize: '13px', padding: '6px 12px' }}
            >
              Resume Sorting
            </button>
          </div>
        </div>
      )}

      {progress && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
          {progress}
        </div>
      )}

      {!accessToken ? (
        <div style={{ backgroundColor: 'var(--yt-spec-menu-background)', border: '1px solid var(--yt-spec-border-color)', padding: '24px', borderRadius: '8px', textAlign: 'center', marginTop: '20px' }}>
          <h3 style={{ color: 'var(--yt-spec-text-primary)', marginBottom: '8px' }}>Google Account Connection Required</h3>
          <p style={{ color: 'var(--yt-spec-text-secondary)' }}>You must click "Sign in with Google" at the top right to access dashboard and backup operations.</p>
        </div>
      ) : loading || isExecuting ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          {isExecuting ? "Scanning playlist video lists..." : "Loading your playlists..."}
        </div>
      ) : proposedPlan ? (
        <div className="proposed-plan">
          <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4caf50', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Check color="#4caf50" size={24} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#4caf50' }}>Sorting Calculation Complete</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--yt-spec-text-secondary)' }}>
                Estimated API Quota Cost: <strong style={{ color: '#4caf50' }}>{quotaCost.toLocaleString()} units</strong> (out of your 10,000 daily limit).
              </p>
            </div>
          </div>

          <h2 style={{ marginBottom: '16px', color: '#4caf50' }}>Proposed Merge Plan</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(proposedPlan).map(([masterName, pList]) => (
              <div key={masterName} style={{ backgroundColor: 'var(--yt-spec-menu-background)', padding: '16px', borderRadius: '8px', border: '1px solid var(--yt-spec-border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{getCleanCategoryName(masterName)}</h3>
                  <button 
                    onClick={() => handleRenameProposedCategory(masterName)}
                    style={{ color: 'var(--yt-spec-text-secondary)', display: 'flex', alignItems: 'center', padding: '4px', cursor: 'pointer' }}
                    title="Rename category"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {pList.map(p => (
                    <div key={p.id} style={{ backgroundColor: 'var(--yt-spec-hover-background)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span 
                        onClick={() => openPlaylistOnYouTube(p.id)}
                        style={{ fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                        title="Open on YouTube"
                      >
                        {p.title} ({p.videos} videos)
                      </span>
                      
                      {/* Video lists with small thumbnails */}
                      {p.videoItems && p.videoItems.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: '2px solid var(--yt-spec-border-color)', maxHeight: '120px', overflowY: 'auto' }}>
                          {p.videoItems.slice(0, 15).map((v, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                              {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: '28px', height: '16px', borderRadius: '2px', objectFit: 'cover' }} />}
                              <span style={{ color: 'var(--yt-spec-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{v.title}</span>
                            </div>
                          ))}
                          {p.videoItems.length > 15 && (
                            <span style={{ fontSize: '10px', color: 'var(--yt-spec-text-secondary)', fontStyle: 'italic', paddingLeft: '4px' }}>
                              + {p.videoItems.length - 15} more videos
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--yt-spec-text-secondary)', marginBottom: '16px' }}>
            Toggle whether a playlist should be sorted into a master category, or protected in the safe zone. Click a card to open it on YouTube.
          </p>
          
          {displayedPlaylists.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--yt-spec-text-secondary)' }}>
              No playlists match your search.
            </div>
          ) : (
            <div className="playlists-grid">
              {displayedPlaylists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  className="playlist-card" 
                  onClick={() => openPlaylistOnYouTube(playlist.id)}
                  style={{ 
                    opacity: playlist.ignore ? 0.7 : 1, 
                    position: 'relative',
                    zIndex: activeMenuId === playlist.id ? 10 : 1
                  }}
                >
                  <div className="playlist-thumbnail" style={{ backgroundImage: `url(${playlist.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!playlist.thumbnail && <PlaySquare size={32} color="var(--yt-spec-text-secondary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                    <div className="playlist-video-count">{playlist.videos} videos</div>
                    
                    {playlist.ignore && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                        <Shield color="#cc0000" size={32} />
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>PROTECTED</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="playlist-info">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="playlist-title" style={{ minHeight: '36px', maxWidth: '80%' }}>{playlist.title}</span>
                        
                        {/* Three-dot Context Menu */}
                        <div style={{ position: 'relative' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === playlist.id ? null : playlist.id); }}
                            style={{ color: 'var(--yt-spec-text-secondary)', padding: '2px' }}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenuId === playlist.id && (
                            <div className="dropdown-menu" style={{ top: '24px', right: 0, minWidth: '150px', display: 'flex', flexDirection: 'column', zIndex: 102 }}>
                              <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleRenamePlaylist(playlist); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Edit2 size={14} />
                                Rename
                              </button>
                              <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveThumbnailPlaylist(playlist); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Image size={14} />
                                Change Cover
                              </button>
                              <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cc0000' }}>
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="segmented-control">
                        <button 
                          className={`segmented-btn ${!playlist.ignore ? 'active-sort' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleIgnore(playlist.id, false); }}
                        >
                          Sort
                        </button>
                        <button 
                          className={`segmented-btn ${playlist.ignore ? 'active-protect' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleIgnore(playlist.id, true); }}
                        >
                          Protect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
