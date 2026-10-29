/**
 * modal.js
 * 산출물(PDF, 이미지, 영상) 및 프로젝트 상세(STAR) 인터랙티브 모달 시스템
 */

const ModalSystem = (function () {
  const backdrop = document.getElementById('modal-backdrop');
  const modalContainer = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFooter = document.getElementById('modal-footer');

  function init() {
    if (!backdrop || !modalCloseBtn) return;

    modalCloseBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    // Pause any active videos
    const activeVideo = modalBody.querySelector('video');
    if (activeVideo) activeVideo.pause();
    setTimeout(() => {
      modalBody.innerHTML = '';
      if (modalFooter) modalFooter.innerHTML = '';
    }, 250);
  }

  function openModal() {
    if (!backdrop) return;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * 증빙 파일(이미지, PDF, 동영상) 전용 모달 열기
   */
  function openAssetModal(title, subtitle, filePath, fileType) {
    if (!modalTitle || !modalSubtitle || !modalBody) return;

    modalTitle.textContent = title;
    modalSubtitle.textContent = subtitle || '증빙 자료 및 산출물 뷰어';

    const cleanPath = filePath.trim();
    const encodedPath = encodeURI(cleanPath);

    let viewerHTML = '';

    if (fileType === 'image') {
      viewerHTML = `
        <div class="modal-viewer-content">
          <img src="${encodedPath}" alt="${title}" loading="lazy" />
        </div>
      `;
    } else if (fileType === 'pdf') {
      viewerHTML = `
        <div class="modal-viewer-content">
          <iframe src="${encodedPath}#toolbar=1" title="${title}"></iframe>
        </div>
      `;
    } else if (fileType === 'video') {
      viewerHTML = `
        <div class="modal-viewer-content">
          <video controls autoplay playsinline style="width: 100%; max-height: 70vh;">
            <source src="${encodedPath}" type="video/mp4">
            브라우저가 비디오 재생을 지원하지 않습니다.
          </video>
        </div>
      `;
    } else {
      viewerHTML = `
        <div class="modal-viewer-content" style="text-align:center; padding: 40px;">
          <p style="margin-bottom: 20px; color: var(--text-secondary);">이 파일 형식은 브라우저에서 직접 미리보기가 지원되지 않습니다.</p>
          <a href="${encodedPath}" download class="btn btn-primary">
            파일 다운로드
          </a>
        </div>
      `;
    }

    modalBody.innerHTML = viewerHTML;

    // Footer actions
    if (modalFooter) {
      modalFooter.innerHTML = `
        <span style="font-size: 0.85rem; color: var(--text-muted);">${cleanPath}</span>
        <div style="display:flex; gap:10px;">
          <a href="${encodedPath}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            새 창에서 열기
          </a>
          <a href="${encodedPath}" download class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            다운로드
          </a>
        </div>
      `;
    }

    openModal();
  }

  /**
   * 프로젝트 상세(STAR 기법 및 산출물 브라우징) 모달 열기
   */
  function openProjectModal(projectId) {
    const project = PORTFOLIO_DATA.projects.find(p => p.id === projectId);
    if (!project) return;

    modalTitle.textContent = project.title;
    modalSubtitle.textContent = `${project.period} · ${project.role}`;

    const deliverablesHTML = project.deliverables && project.deliverables.length > 0 ? `
      <div class="project-detail-section">
        <div class="section-label-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          프로젝트 실물 산출물 및 증빙 자료 (${project.deliverables.length}건)
        </div>
        <div class="deliverables-grid">
          ${project.deliverables.map((d, idx) => `
            <div class="deliverable-card" onclick="ModalSystem.openAssetModal('${d.name.replace(/'/g, "\\'")}', '${project.title.replace(/'/g, "\\'")}', '${d.path.replace(/'/g, "\\'")}', '${d.type}')">
              <div class="deliverable-info">
                <div class="deliverable-icon ${d.type}">
                  ${d.type === 'pdf' ? 'PDF' : (d.type === 'video' ? 'MP4' : 'IMG')}
                </div>
                <div class="deliverable-name" title="${d.name}">${d.name}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); flex-shrink: 0;">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const actionsListHTML = Array.isArray(project.action) 
      ? project.action.map(item => `<li>${item}</li>`).join('') 
      : `<li>${project.action}</li>`;

    modalBody.innerHTML = `
      <div class="project-detail-container">
        <!-- 담당 역할 배너 -->
        <div style="display:flex; align-items:center; gap:12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 20px;">
          <div style="font-size:1.4rem;">👤</div>
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-primary); text-transform:uppercase; letter-spacing:0.04em;">프로젝트 내 담당 역할 (My Role)</div>
            <div style="font-size:1rem; font-weight:700; color:var(--text-primary); margin-top:2px;">${project.role}</div>
          </div>
        </div>

        <!-- 핵심 요약 -->
        <div class="project-detail-section" style="background: var(--bg-surface-elevated); padding: 18px 20px; border-radius: var(--radius-md); border-left: 4px solid var(--color-primary); margin-bottom: 24px;">
          <h4 style="font-size: 1rem; margin-bottom: 6px; color: var(--color-primary);">프로젝트 개요 (Executive Summary)</h4>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${project.summary}</p>
        </div>

        <!-- STAR 심층 프레임워크 -->
        <div class="project-detail-section">
          <div class="section-label-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            STAR 직무 수행 상세 분석
          </div>
          <div class="star-grid">
            <div class="star-card">
              <h4>🎯 상황 (Situation)</h4>
              <p>${project.situation}</p>
            </div>
            <div class="star-card">
              <h4>📋 과제 (Task)</h4>
              <p>${project.task}</p>
            </div>
            <div class="star-card" style="grid-column: 1 / -1;">
              <h4>⚡ 수행 행동 & 전략 (Action)</h4>
              <ul>${actionsListHTML}</ul>
            </div>
            <div class="star-card" style="grid-column: 1 / -1; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.25);">
              <h4 style="color: var(--color-primary);">🏆 성과 및 배운 점 (Result)</h4>
              <p style="color: var(--text-primary); font-weight: 500;">${project.result}</p>
            </div>
          </div>
        </div>

        <!-- 산출물 목록 -->
        ${deliverablesHTML}
      </div>
    `;

    if (modalFooter) {
      modalFooter.innerHTML = `
        <span style="font-size: 0.85rem; color: var(--text-muted);">${project.badge || 'Verified Project'}</span>
        <button class="btn btn-secondary btn-sm" onclick="ModalSystem.closeModal()">닫기</button>
      `;
    }

    openModal();
  }

  return {
    init,
    openAssetModal,
    openProjectModal,
    closeModal
  };
})();
