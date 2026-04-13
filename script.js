// script.js
import { auth, database, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './firebase-config.js';
import { ref, set, onValue, push, remove, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ADMIN_EMAIL = 'jasim28v@gmail.com';
let currentUser = null;
let isAdmin = false;
let currentVideoId = null;
let plyrInstance = null;

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const adminSidebar = document.getElementById('adminSidebar');
const memberList = document.getElementById('memberList');
const adminVideoList = document.getElementById('adminVideoList');
const totalMembers = document.getElementById('totalMembers');
const totalVideos = document.getElementById('totalVideos');
const displayName = document.getElementById('displayName');
const uploadSection = document.getElementById('uploadSection');
const authButtons = document.getElementById('authButtons');
const userArea = document.getElementById('userArea');
const guestMessage = document.getElementById('guestMessage');
const uploadBtn = document.getElementById('uploadBtn');
const videoFile = document.getElementById('videoFile');
const videoTitle = document.getElementById('videoTitle');
const progressBar = document.getElementById('progressBar');
const uploadStatus = document.getElementById('uploadStatus');

// Modal Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const modalVideoUploader = document.getElementById('modalVideoUploader');
const modalVideoDate = document.getElementById('modalVideoDate');
const modalVideoViews = document.getElementById('modalVideoViews');
const modalLikesCount = document.getElementById('modalLikesCount');
const modalLikeBtn = document.getElementById('modalLikeBtn');
const commentList = document.getElementById('commentList');
const commentInput = document.getElementById('commentInput');
const commentsCount = document.getElementById('commentsCount');

// Footer Stats
const footerMembers = document.getElementById('footerMembers');
const footerVideos = document.getElementById('footerVideos');
const footerViews = document.getElementById('footerViews');
const footerLikes = document.getElementById('footerLikes');

// ========== Toast System ==========
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========== Auth Functions ==========
window.showAuthModal = (tab = 'login') => {
    authModal.style.display = 'flex';
    switchAuthTab(tab);
};

window.closeAuthModal = () => {
    authModal.style.display = 'none';
    authMessage.innerHTML = '';
};

window.switchAuthTab = (tab) => {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    authMessage.innerHTML = '';
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
        showToast('تم تسجيل الدخول بنجاح!', 'success');
    } catch (error) {
        authMessage.innerHTML = `<span style="color: #f44336;">❌ ${error.message}</span>`;
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        await set(ref(database, `users/${userCredential.user.uid}`), {
            name: name,
            email: email,
            createdAt: Date.now(),
            role: email === ADMIN_EMAIL ? 'admin' : 'member',
            avatar: name.charAt(0).toUpperCase()
        });
        
        closeAuthModal();
        showToast('تم إنشاء الحساب بنجاح!', 'success');
    } catch (error) {
        authMessage.innerHTML = `<span style="color: #f44336;">❌ ${error.message}</span>`;
    }
});

// ========== Auth State ==========
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdmin = user?.email === ADMIN_EMAIL;
    
    if (user) {
        authButtons.style.display = 'none';
        userArea.style.display = 'flex';
        displayName.textContent = user.displayName || user.email;
        uploadSection.style.display = 'block';
        guestMessage.style.display = 'none';
        
        if (isAdmin) {
            adminSidebar.style.display = 'block';
            loadAdminData();
        } else {
            adminSidebar.style.display = 'none';
        }
    } else {
        authButtons.style.display = 'flex';
        userArea.style.display = 'none';
        uploadSection.style.display = 'none';
        guestMessage.style.display = 'flex';
        adminSidebar.style.display = 'none';
    }
    
    loadVideos();
    updateFooterStats();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
    showToast('تم تسجيل الخروج', 'success');
});

// ========== Footer Stats ==========
async function updateFooterStats() {
    const usersRef = ref(database, 'users');
    const videosRef = ref(database, 'videos');
    
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        footerMembers.textContent = users ? Object.keys(users).length : 0;
    });
    
    onValue(videosRef, (snapshot) => {
        const videos = snapshot.val();
        if (videos) {
            const videoArray = Object.values(videos);
            footerVideos.textContent = videoArray.length;
            const totalViews = videoArray.reduce((sum, v) => sum + (v.views || 0), 0);
            const totalLikes = videoArray.reduce((sum, v) => sum + (v.likes || 0), 0);
            footerViews.textContent = totalViews;
            footerLikes.textContent = totalLikes;
        }
    });
}

// ========== Admin Functions ==========
function loadAdminData() {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        memberList.innerHTML = '';
        let memberCount = 0;
        
        if (users) {
            Object.entries(users).forEach(([uid, user]) => {
                memberCount++;
                const div = document.createElement('div');
                div.className = 'member-item';
                div.innerHTML = `
                    <span>${user.name || user.email} ${user.email === ADMIN_EMAIL ? '👑' : ''}</span>
                    ${user.email !== ADMIN_EMAIL ? `<button class="btn-danger btn-sm" onclick="deleteMember('${uid}')">حذف</button>` : ''}
                `;
                memberList.appendChild(div);
            });
        }
        totalMembers.textContent = memberCount;
    });
    
    const videosRef = ref(database, 'videos');
    onValue(videosRef, (snapshot) => {
        const videos = snapshot.val();
        adminVideoList.innerHTML = '';
        let videoCount = 0;
        
        if (videos) {
            Object.entries(videos).forEach(([vidId, video]) => {
                videoCount++;
                const div = document.createElement('div');
                div.className = 'admin-video-item';
                div.innerHTML = `
                    <span style="flex: 1;">${video.title || 'بدون عنوان'}</span>
                    <div>
                        ${video.visible === false ? '<span style="color: #ff9800; margin-left: 10px;">👁️ مخفي</span>' : ''}
                        <button class="btn-outline btn-sm" onclick="toggleVideoVisibility('${vidId}', ${video.visible !== false})">${video.visible !== false ? 'إخفاء' : 'إظهار'}</button>
                        <button class="btn-danger btn-sm" onclick="adminDeleteVideo('${vidId}')">حذف</button>
                    </div>
                `;
                adminVideoList.appendChild(div);
            });
        }
        totalVideos.textContent = videoCount;
    });
}

// ========== Load Videos ==========
function loadVideos() {
    const videosRef = ref(database, 'videos');
    onValue(videosRef, (snapshot) => {
        videoGrid.innerHTML = '';
        const videos = snapshot.val();
        
        if (!videos) {
            videoGrid.innerHTML = '<div style="color: #aaa; text-align: center; grid-column: 1/-1; padding: 40px;"><i class="fas fa-video-slash"></i> لا توجد فيديوهات بعد</div>';
            return;
        }
        
        const videoArray = Object.entries(videos)
            .map(([id, video]) => ({ id, ...video }))
            .filter(video => video.visible !== false)
            .reverse();
        
        videoArray.forEach(video => {
            const canDelete = isAdmin || video.uploadedBy === currentUser?.uid;
            
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="thumbnail-container">
                    <video class="thumbnail" src="${video.url}" muted></video>
                    ${canDelete ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteVideo('${video.id}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div class="card-info">
                    <div class="video-title">
                        <i class="fas fa-play-circle" style="color: #ff4081;"></i>
                        ${video.title || 'بدون عنوان'}
                    </div>
                    <div class="video-meta">
                        <span><i class="fas fa-user"></i> ${video.uploaderName || 'مستخدم'}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(video.timestamp).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div class="video-stats">
                        <span><i class="fas fa-eye"></i> ${video.views || 0}</span>
                        <span class="like-btn" onclick="event.stopPropagation(); toggleCardLike('${video.id}')">
                            <i class="far fa-heart"></i> <span>${video.likes || 0}</span>
                        </span>
                        <span><i class="fas fa-comment"></i> ${video.comments ? Object.keys(video.comments).length : 0}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openVideoModal(video));
            videoGrid.appendChild(card);
        });
    });
}

// ========== Video Modal ==========
let currentVideo = null;

window.openVideoModal = (video) => {
    currentVideo = video;
    currentVideoId = video.id;
    videoModal.style.display = 'block';
    modalVideoTitle.textContent = video.title;
    modalVideoUploader.textContent = video.uploaderName || 'مستخدم';
    modalVideoDate.textContent = new Date(video.timestamp).toLocaleDateString('ar-SA');
    modalVideoViews.textContent = video.views || 0;
    modalLikesCount.textContent = video.likes || 0;
    commentsCount.textContent = video.comments ? Object.keys(video.comments).length : 0;
    
    // Initialize Plyr
    if (plyrInstance) plyrInstance.destroy();
    plyrInstance = new Plyr(modalVideo, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'pip', 'fullscreen'],
        autoplay: true
    });
    modalVideo.src = video.url;
    
    // Check if user liked
    if (currentUser) {
        const userLikeRef = ref(database, `videos/${video.id}/likedBy/${currentUser.uid}`);
        get(userLikeRef).then(snapshot => {
            if (snapshot.exists()) {
                modalLikeBtn.classList.add('liked');
                modalLikeBtn.querySelector('i').className = 'fas fa-heart';
            }
        });
    }
    
    // Load comments
    loadComments(video.id);
    
    // Show/hide comment form
    document.getElementById('commentFormContainer').style.display = currentUser ? 'block' : 'none';
    
    // Increment views
    update(ref(database, `videos/${video.id}`), { views: (video.views || 0) + 1 });
};

window.closeVideoModal = () => {
    videoModal.style.display = 'none';
    if (plyrInstance) {
        plyrInstance.destroy();
        plyrInstance = null;
    }
    currentVideo = null;
    currentVideoId = null;
};

window.toggleLike = async () => {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const videoRef = ref(database, `videos/${currentVideoId}`);
    const userLikeRef = ref(database, `videos/${currentVideoId}/likedBy/${currentUser.uid}`);
    
    const snapshot = await get(userLikeRef);
    const isLiked = snapshot.exists();
    
    if (isLiked) {
        await remove(userLikeRef);
        await update(videoRef, { likes: (currentVideo.likes || 1) - 1 });
        modalLikeBtn.classList.remove('liked');
        modalLikeBtn.querySelector('i').className = 'far fa-heart';
        modalLikesCount.textContent = (currentVideo.likes || 1) - 1;
        currentVideo.likes--;
        showToast('تم إلغاء الإعجاب', 'success');
    } else {
        await set(userLikeRef, true);
        await update(videoRef, { likes: (currentVideo.likes || 0) + 1 });
        modalLikeBtn.classList.add('liked');
        modalLikeBtn.querySelector('i').className = 'fas fa-heart';
        modalLikesCount.textContent = (currentVideo.likes || 0) + 1;
        currentVideo.likes++;
        showToast('تم الإعجاب! ❤️', 'success');
    }
};

window.toggleCardLike = async (videoId) => {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const videoRef = ref(database, `videos/${videoId}`);
    const userLikeRef = ref(database, `videos/${videoId}/likedBy/${currentUser.uid}`);
    
    const videoSnapshot = await get(videoRef);
    const video = videoSnapshot.val();
    const likeSnapshot = await get(userLikeRef);
    const isLiked = likeSnapshot.exists();
    
    if (!isLiked) {
        await set(userLikeRef, true);
        await update(videoRef, { likes: (video.likes || 0) + 1 });
        showToast('تم الإعجاب! ❤️', 'success');
    }
};

// ========== Comments ==========
function loadComments(videoId) {
    const commentsRef = ref(database, `videos/${videoId}/comments`);
    onValue(commentsRef, (snapshot) => {
        commentList.innerHTML = '';
        const comments = snapshot.val();
        
        if (!comments) {
            commentList.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">لا توجد تعليقات بعد. كن أول من يعلق!</div>';
            commentsCount.textContent = '0';
            return;
        }
        
        const commentsArray = Object.entries(comments).reverse();
        commentsCount.textContent = commentsArray.length;
        
        commentsArray.forEach(([id, comment]) => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <div class="comment-avatar">${comment.userName?.charAt(0) || 'U'}</div>
                <div class="comment-content">
                    <div class="comment-author">${comment.userName || 'مستخدم'}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-time">${new Date(comment.timestamp).toLocaleString('ar-SA')}</div>
                </div>
            `;
            commentList.appendChild(div);
        });
    });
}

window.addComment = async () => {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const text = commentInput.value.trim();
    if (!text) return;
    
    const commentsRef = ref(database, `videos/${currentVideoId}/comments`);
    const newCommentRef = push(commentsRef);
    
    await set(newCommentRef, {
        text: text,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        timestamp: Date.now()
    });
    
    commentInput.value = '';
    showToast('تم إضافة التعليق!', 'success');
};

window.shareVideo = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    showToast('تم نسخ الرابط! 📋', 'success');
};

// ========== Video Delete ==========
window.deleteVideo = async (videoId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    await remove(ref(database, `videos/${videoId}`));
    showToast('تم حذف الفيديو', 'success');
};

window.adminDeleteVideo = async (videoId) => {
    if (!confirm('حذف هذا الفيديو نهائياً؟')) return;
    await remove(ref(database, `videos/${videoId}`));
    showToast('تم حذف الفيديو', 'success');
};

window.toggleVideoVisibility = async (videoId, currentlyVisible) => {
    await update(ref(database, `videos/${videoId}`), { visible: !currentlyVisible });
    showToast(currentlyVisible ? 'تم إخفاء الفيديو' : 'تم إظهار الفيديو', 'success');
};

window.deleteMember = async (uid) => {
    if (!confirm('حذف هذا العضو وجميع فيديوهاته؟')) return;
    
    const videosRef = ref(database, 'videos');
    const snapshot = await get(videosRef);
    const videos = snapshot.val();
    
    if (videos) {
        for (const [vidId, video] of Object.entries(videos)) {
            if (video.uploadedBy === uid) {
                await remove(ref(database, `videos/${vidId}`));
            }
        }
    }
    
    await remove(ref(database, `users/${uid}`));
    showToast('تم حذف العضو', 'success');
};

// ========== Upload Video ==========
uploadBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const file = videoFile.files[0];
    const title = videoTitle.value.trim();
    
    if (!file || !title) {
        showToast('الرجاء اختيار ملف وإدخال عنوان', 'error');
        return;
    }
    
    uploadBtn.disabled = true;
    progressBar.style.display = 'block';
    uploadStatus.textContent = '⏳ جاري الرفع...';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('resource_type', 'video');
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.secure_url) {
            const newVideoRef = push(ref(database, 'videos'));
            await set(newVideoRef, {
                url: data.secure_url,
                title: title,
                uploadedBy: currentUser.uid,
                uploaderName: currentUser.displayName || currentUser.email,
                timestamp: Date.now(),
                views: 0,
                likes: 0,
                visible: true
            });
            
            uploadStatus.textContent = '🎉 تم النشر بنجاح!';
            videoFile.value = '';
            videoTitle.value = '';
            showToast('تم رفع الفيديو بنجاح! 🎬', 'success');
        } else {
            throw new Error(data.error?.message || 'فشل الرفع');
        }
    } catch (error) {
        uploadStatus.textContent = `❌ خطأ: ${error.message}`;
        showToast('فشل الرفع: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
        progressBar.style.display = 'none';
    }
});
