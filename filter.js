/**
 * filter.js
 * 프로젝트 실시간 카테고리/검색 필터 및 자격증/수료증 탭 전환
 */

const FilterSystem = (function () {
  let currentCategory = 'all';
  let searchQuery = '';
  let activeCredentialTab = 'certs'; // 'certs' or 'completions'

  function init() {
    setupFilterChips();
    setupSearchInput();
    setupCredentialTabs();
    renderAll();
  }

  function setupFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = chip.getAttribute('data-category');
        renderProjects();
      });
    });
  }

  function setupSearchInput() {
    const searchInput = document.getElementById('project-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProjects();
    });
  }

  function setupCredentialTabs() {
    const certsTabBtn = document.getElementById('tab-certs-btn');
    const completionsTabBtn = document.getElementById('tab-completions-btn');

    if (certsTabBtn && completionsTabBtn) {
      certsTabBtn.addEventListener('click', () => {
        certsTabBtn.classList.add('active');
        completionsTabBtn.classList.remove('active');
        activeCredentialTab = 'certs';
        renderCredentials();
      });

      completionsTabBtn.addEventListener('click', () => {
        completionsTabBtn.classList.add('active');
        certsTabBtn.classList.remove('active');
        activeCredentialTab = 'completions';
        renderCredentials();
      });
    }
  }

  /**
   * 프로젝트 카드 렌더링
   */
  function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filtered = PORTFOLIO_DATA.projects.filter(project => {
      const matchCategory = currentCategory === 'all' || project.category === currentCategory;
      const matchSearch = !searchQuery || (
        project.title.toLowerCase().includes(searchQuery) ||
        project.subtitle.toLowerCase().includes(searchQuery) ||
        project.summary.toLowerCase().includes(searchQuery) ||
        (project.role && project.role.toLowerCase().includes(searchQuery)) ||
        project.tags.some(t => t.toLowerCase().includes(searchQuery))
      );
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 14px; opacity: 0.6;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 6px;">조건에 일치하는 프로젝트가 없습니다.</p>
          <p style="font-size: 0.9rem;">다른 검색어를 입력하시거나 카테고리 필터를 변경해 보세요.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const deliverablesCount = p.deliverables ? p.deliverables.length : 0;
      return `
        <article class="glass-card card-interactive project-card reveal">
          <div class="project-card-header">
            <span class="badge ${p.badge.includes('대상') ? 'badge-gold' : (p.badge.includes('우수') ? 'badge-blue' : 'badge-emerald')}">
              ${p.badge}
            </span>
            <span class="project-meta-pill">${p.period}</span>
          </div>

          <h3 class="project-title">${p.title}</h3>
          <div class="project-subtitle">${p.subtitle}</div>

          <div class="project-role-box">
            <strong>👤 담당 역할:</strong>
            <span>${p.role}</span>
          </div>

          <p class="project-summary">${p.summary}</p>

          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom: 18px;">
            ${p.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>

          <div class="project-card-footer">
            <div class="project-deliverables-count">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>산출물 ${deliverablesCount}건 연동</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="ModalSystem.openProjectModal('${p.id}')">
              상세보기 & 산출물
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Trigger reveal class refresh
    if (window.refreshObserver) window.refreshObserver();
  }

  /**
   * 수상 내역 (Awards) 렌더링
   */
  function renderAwards() {
    const container = document.getElementById('awards-grid');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.awards.map(award => {
      const isGold = award.rank === 1;
      const isSilver = award.rank === 2;
      const trophyClass = isGold ? 'gold' : (isSilver ? 'silver' : 'bronze');

      return `
        <div class="glass-card card-interactive award-card reveal">
          <div class="award-trophy-badge ${trophyClass}">
            ${isGold ? '🏆' : (isSilver ? '🥈' : '🎖️')}
          </div>
          <span class="award-grade-tag" style="color: ${isGold ? '#F59E0B' : (isSilver ? '#3B82F6' : '#10B981')}">
            ${award.badge}
          </span>
          <h3 class="award-title">${award.title}</h3>
          <div class="award-meta">${award.issuer} · ${award.date}</div>
          <p class="award-summary">${award.summary}</p>
          <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: auto;" 
            onclick="ModalSystem.openAssetModal('${award.title.replace(/'/g, "\\'")}', '${award.issuer} · ${award.grade}', '${award.file}', '${award.fileType}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            상장 원본 증빙 보기
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * 자격증 & 수료증 렌더링
   */
  function renderCredentials() {
    const container = document.getElementById('credentials-grid');
    if (!container) return;

    const items = activeCredentialTab === 'certs' 
      ? PORTFOLIO_DATA.certifications 
      : PORTFOLIO_DATA.certificatesOfCompletion;

    container.innerHTML = items.map(item => `
      <div class="glass-card card-interactive credential-card reveal">
        <div class="cred-left">
          <div class="cred-icon">
            ${activeCredentialTab === 'certs' ? '📜' : '🎓'}
          </div>
          <div class="cred-info">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom: 2px;">
              <h4>${item.name}</h4>
              <span class="badge ${activeCredentialTab === 'certs' ? 'badge-blue' : 'badge-emerald'}" style="font-size:0.7rem; padding: 2px 8px;">
                ${item.badge}
              </span>
            </div>
            <div class="cred-issuer">${item.issuer} ${item.date ? `· ${item.date}` : ''}</div>
            <p class="cred-desc">${item.desc}</p>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" style="flex-shrink: 0;"
          onclick="ModalSystem.openAssetModal('${item.name.replace(/'/g, "\\'")}', '${item.issuer}', '${item.file}', '${item.fileType}')" title="증빙서류 열람">
          증빙 열람
        </button>
      </div>
    `).join('');

    if (window.refreshObserver) window.refreshObserver();
  }

  function renderAll() {
    renderProjects();
    renderAwards();
    renderCredentials();
  }

  return {
    init,
    renderProjects,
    renderAwards,
    renderCredentials
  };
})();
