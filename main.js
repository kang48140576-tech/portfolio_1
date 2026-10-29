/**
 * main.js
 * 메인 애플리케이션 초기화, 스크롤 인터랙션, 클립보드 복사, 토스트 알림
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 모달 및 필터 시스템 초기화
  ModalSystem.init();
  FilterSystem.init();

  // 2. 토스트 알림 함수
  window.showToast = function (message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent-emerald);">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // 3. 이메일 클립보드 복사
  const emailCopyBtn = document.getElementById('copy-email-btn');
  const heroCopyBtn = document.getElementById('hero-copy-email-btn');
  const primaryEmail = (PORTFOLIO_DATA.profile && PORTFOLIO_DATA.profile.email) || 'kang48140576@gmail.com';

  window.copySpecificEmail = function (emailToCopy) {
    const text = emailToCopy || primaryEmail;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast(`이메일 주소(${text})가 복사되었습니다.`);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      window.showToast(`이메일 주소(${text})가 복사되었습니다.`);
    } catch (e) {
      window.showToast(`복사 실패: ${text}`);
    }
    document.body.removeChild(tempInput);
  }

  function copyDefaultEmail() {
    window.copySpecificEmail(primaryEmail);
  }

  if (emailCopyBtn) emailCopyBtn.addEventListener('click', copyDefaultEmail);
  if (heroCopyBtn) heroCopyBtn.addEventListener('click', copyDefaultEmail);

  // 4. 네비게이션 스크롤 효과 & 액티브 링크 추적
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // 5. 모바일 네비게이션 드로어 토글
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  // 6. 스크롤 페이드인 Reveal 옵저버
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  window.refreshObserver = function () {
    const revealElements = document.querySelectorAll('.reveal:not(.active)');
    revealElements.forEach(el => revealObserver.observe(el));
  };

  window.refreshObserver();

  // 7. 카운터 숫자 애니메이션
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target') || stat.textContent, 10);
    if (!isNaN(target)) {
      let count = 0;
      const step = Math.max(1, Math.floor(target / 20));
      const interval = setInterval(() => {
        count += step;
        if (count >= target) {
          count = target;
          clearInterval(interval);
        }
        stat.textContent = count + (stat.getAttribute('data-suffix') || '');
      }, 40);
    }
  });
});
