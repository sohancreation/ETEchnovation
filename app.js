/**
 * ETEchnovation 2.0 - Campus Ambassador Recruitment Application
 * Full Client Logic: Form wizard, LocalStorage draft & registry,
 * Video interactions, Lightbox, Admin portal & CSV export.
 */

// Official Google Apps Script Web App Endpoint for Real-Time Google Sheets Logging
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxm07ynQrVWiOnpNYERN5Fw-I1g2trlE0xiRqwdp-SLOqrklmMY4GfPJ1_kh-fnxMYq/exec';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initThemeToggle();
  initCountdown();
  initVideoInteractions();
  initModals();
  initFaqAccordion();
  initMobileMenu();
  initApplicationForm();
  initAdminPortal();
});

/* ===================================================================
   1. Theme Toggle (Dark / Light Mode)
   =================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const root = document.documentElement;

  // Retrieve saved theme or default to dark
  const savedTheme = localStorage.getItem('etechnovation_theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark Tech' : 'Carnival Light'} mode`);
  });

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('etechnovation_theme', theme);
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggleBtn.title = 'Switch to Light Mode';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggleBtn.title = 'Switch to Dark Mode';
    }
  }
}

/* ===================================================================
   2. Live Countdown Timer
   =================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');

  // Target deadline: 14 days from now or fixed target
  let targetDate = localStorage.getItem('etechnovation_deadline');
  if (!targetDate) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    d.setHours(23, 59, 59);
    targetDate = d.getTime();
    localStorage.setItem('etechnovation_deadline', targetDate);
  } else {
    targetDate = parseInt(targetDate, 10);
  }

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ===================================================================
   3. Video Interactions & Reactions
   =================================================================== */
function initVideoInteractions() {
  const reactionButtons = document.querySelectorAll('.reaction-btn[data-reaction]');
  const shareBtn = document.getElementById('shareVideoBtn');

  // Load reaction counts from storage
  reactionButtons.forEach(btn => {
    const reactionType = btn.getAttribute('data-reaction');
    const countEl = btn.querySelector('.count');
    const storedCount = localStorage.getItem(`ete_reaction_${reactionType}`);
    const hasReacted = localStorage.getItem(`ete_user_reacted_${reactionType}`);

    if (storedCount && countEl) {
      countEl.textContent = storedCount;
    }
    if (hasReacted) {
      btn.classList.add('reacted');
    }

    btn.addEventListener('click', () => {
      let currentVal = parseInt(countEl.textContent, 10) || 0;
      if (btn.classList.contains('reacted')) {
        currentVal = Math.max(0, currentVal - 1);
        btn.classList.remove('reacted');
        localStorage.removeItem(`ete_user_reacted_${reactionType}`);
      } else {
        currentVal += 1;
        btn.classList.add('reacted');
        localStorage.setItem(`ete_user_reacted_${reactionType}`, 'true');
        triggerReactionBounce(btn);
      }
      countEl.textContent = currentVal;
      localStorage.setItem(`ete_reaction_${reactionType}`, currentVal);
    });
  });

  // Video Share
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'ETEchnovation 2.0 - Campus Ambassador Recruitment',
        text: 'Join as Campus Ambassador for ETEchnovation 2.0 at RUET! Cash prizes, certificates, food & exclusive perks.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showToast('Shared successfully!');
        } catch (e) {
          // User cancelled or error
        }
      } else {
        // Fallback copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showToast('Website link copied to clipboard!');
      }
    });
  }

  function triggerReactionBounce(el) {
    el.style.transform = 'scale(1.25)';
    setTimeout(() => {
      el.style.transform = '';
    }, 200);
  }
}

/* ===================================================================
   4. Modals (Poster Lightbox, Success Pass, Admin)
   =================================================================== */
function initModals() {
  // Poster Lightbox
  const posterModal = document.getElementById('posterModal');
  const viewPosterBtns = [
    document.getElementById('viewPosterModalBtn'),
    document.getElementById('heroPosterPreview'),
    document.getElementById('openPosterLightbox'),
    document.getElementById('clickablePosterFrame')
  ];
  const closePosterModalBtn = document.getElementById('closePosterModalBtn');

  viewPosterBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(posterModal);
      });
    }
  });

  if (closePosterModalBtn) {
    closePosterModalBtn.addEventListener('click', () => closeModal(posterModal));
  }

  // Success Modal
  const successModal = document.getElementById('successModal');
  const closeSuccessBtns = [
    document.getElementById('closeSuccessModalBtn'),
    document.getElementById('closePassModalBtn')
  ];
  closeSuccessBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => closeModal(successModal));
  });

  // Print Pass button
  const printPassBtn = document.getElementById('printPassBtn');
  if (printPassBtn) {
    printPassBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ===================================================================
   5. FAQ Accordion
   =================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other open items
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ===================================================================
   6. Mobile Menu & Smooth Nav
   =================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const backdrop = document.getElementById('mobileDrawerBackdrop');

  function openDrawer() {
    if (navLinks) navLinks.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (navLinks) navLinks.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (navLinks && navLinks.classList.contains('mobile-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });
  }

  // Scrollspy active indicator
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) navLink.classList.add('active');
      } else {
        if (navLink) navLink.classList.remove('active');
      }
    });
  });
}

/* ===================================================================
   7. Application Form (Multi-Step Wizard + Autosave)
   =================================================================== */
function initApplicationForm() {
  const form = document.getElementById('caApplicationForm');
  if (!form) return;

  const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4')
  ];
  const progressFill = document.getElementById('formProgressFill');
  const stepNodes = document.querySelectorAll('.step-node');
  let currentStep = 1;

  // Restore autosaved draft
  restoreDraft(form);

  // Autosave listener
  form.addEventListener('input', debounce(() => {
    saveDraft(form);
  }, 500));

  form.addEventListener('change', () => {
    saveDraft(form);
  });

  // Mobile keyboard accommodation: auto-hide floating quick bar when typing
  const stickyBar = document.getElementById('mobileStickyBottomBar');
  if (stickyBar) {
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('focus', () => {
        stickyBar.style.transform = 'translateY(150%)';
        stickyBar.style.opacity = '0';
        stickyBar.style.pointerEvents = 'none';
      });
      input.addEventListener('blur', () => {
        stickyBar.style.transform = '';
        stickyBar.style.opacity = '';
        stickyBar.style.pointerEvents = '';
      });
    });
  }

  // Next step buttons
  document.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-next'), 10);
      if (validateStep(currentStep)) {
        goToStep(targetStep);
      }
    });
  });

  // Prev step buttons
  document.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-prev'), 10);
      goToStep(targetStep);
    });
  });

  function goToStep(stepNum) {
    currentStep = stepNum;
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === stepNum);
    });

    // Update Progress bar width
    const percentage = (stepNum / steps.length) * 100;
    progressFill.style.width = `${percentage}%`;

    // Update step indicator nodes
    stepNodes.forEach((node, idx) => {
      const nodeStep = idx + 1;
      node.classList.remove('active', 'completed');
      if (nodeStep === stepNum) {
        node.classList.add('active');
      } else if (nodeStep < stepNum) {
        node.classList.add('completed');
      }
    });

    // Scroll form into view gently
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Step Validation Logic
  function validateStep(step) {
    let isValid = true;
    clearErrors();

    if (step === 1) {
      const fullName = document.getElementById('fullName');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const gender = document.getElementById('gender');
      const tshirtSize = document.getElementById('tshirtSize');

      if (!fullName.value.trim()) {
        showFieldError('fullName', 'Please enter your full name');
        isValid = false;
      }
      if (!email.value.trim() || !validateEmail(email.value)) {
        showFieldError('email', 'Please provide a valid email address');
        isValid = false;
      }
      if (!phone.value.trim() || phone.value.trim().length < 8) {
        showFieldError('phone', 'Please enter a valid phone / WhatsApp number');
        isValid = false;
      }
      if (!gender.value) {
        showFieldError('gender', 'Please choose your gender');
        isValid = false;
      }
      if (!tshirtSize.value) {
        showFieldError('tshirtSize', 'Please select your t-shirt size for the kit');
        isValid = false;
      }
    } else if (step === 2) {
      const institution = document.getElementById('institution');
      const department = document.getElementById('department');
      const studyYear = document.getElementById('studyYear');
      const studentId = document.getElementById('studentId');
      const campusCity = document.getElementById('campusCity');

      if (!institution.value.trim()) {
        showFieldError('institution', 'Please specify your university or college name');
        isValid = false;
      }
      if (!department.value.trim()) {
        showFieldError('department', 'Please enter your department/discipline');
        isValid = false;
      }
      if (!studyYear.value) {
        showFieldError('studyYear', 'Please select your current academic year');
        isValid = false;
      }
      if (!studentId.value.trim()) {
        showFieldError('studentId', 'Please enter your student ID / roll number');
        isValid = false;
      }
      if (!campusCity.value.trim()) {
        showFieldError('campusCity', 'Please enter campus city/district');
        isValid = false;
      }
    } else if (step === 3) {
      const facebookUrl = document.getElementById('facebookUrl');
      if (!facebookUrl.value.trim() || !facebookUrl.value.includes('.')) {
        showFieldError('facebookUrl', 'Please enter your valid Facebook profile link');
        isValid = false;
      }
    } else if (step === 4) {
      const motivation = document.getElementById('motivation');
      const promotionPlan = document.getElementById('promotionPlan');
      const termsAgree = document.getElementById('termsAgree');

      if (!motivation.value.trim() || motivation.value.trim().length < 20) {
        showFieldError('motivation', 'Please provide at least a couple of sentences on your motivation');
        isValid = false;
      }
      if (!promotionPlan.value.trim() || promotionPlan.value.trim().length < 20) {
        showFieldError('promotionPlan', 'Please share your promotion strategy (at least 20 characters)');
        isValid = false;
      }
      if (!termsAgree.checked) {
        showFieldError('termsAgree', 'You must agree to the terms and pledge to promote ETEchnovation 2.0');
        isValid = false;
      }
    }

    return isValid;
  }

  function showFieldError(fieldId, msg) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = msg;
    if (inputEl) {
      const group = inputEl.closest('.form-group');
      if (group) group.classList.add('has-error');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const submitBtn = document.getElementById('submitFormBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Google Sheets...';

    // Collect skills
    const selectedSkills = [];
    document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
      selectedSkills.push(cb.value);
    });

    // Form Data object
    const newApplicant = {
      id: generateAppId(),
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      gender: document.getElementById('gender').value,
      tshirtSize: document.getElementById('tshirtSize').value,
      institution: document.getElementById('institution').value.trim(),
      department: document.getElementById('department').value.trim(),
      studyYear: document.getElementById('studyYear').value,
      studentId: document.getElementById('studentId').value.trim(),
      campusCity: document.getElementById('campusCity').value.trim(),
      facebookUrl: document.getElementById('facebookUrl').value.trim(),
      linkedinUrl: document.getElementById('linkedinUrl').value.trim() || 'N/A',
      clubExperience: document.getElementById('clubExperience').value.trim() || 'None specified',
      skills: selectedSkills,
      motivation: document.getElementById('motivation').value.trim(),
      promotionPlan: document.getElementById('promotionPlan').value.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Under Review'
    };

    // 1. Post to Google Sheets Web App in background
    try {
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(newApplicant)
      });
      console.log('Submission sent to Google Sheets Web App:', newApplicant.id);
    } catch (err) {
      console.warn('Google Sheets submission notice:', err);
    }

    // 2. Save local backup to registry
    saveApplicant(newApplicant);

    // 3. Launch Confetti Celebration!
    launchConfetti();

    // 4. Populate Digital Pass
    document.getElementById('passCandidateName').textContent = newApplicant.fullName;
    document.getElementById('passInstitution').textContent = newApplicant.institution;
    document.getElementById('passCardName').textContent = newApplicant.fullName;
    document.getElementById('passCardId').textContent = newApplicant.id;
    document.getElementById('passCardInst').textContent = newApplicant.institution;
    document.getElementById('passCardDept').textContent = `${newApplicant.department} (${newApplicant.studyYear})`;
    document.getElementById('passCardDate').textContent = newApplicant.submittedAt;

    // 5. Show Success Modal
    const successModal = document.getElementById('successModal');
    openModal(successModal);

    // 6. Clear draft & reset form
    localStorage.removeItem('etechnovation_ca_draft');
    form.reset();
    goToStep(1);

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> <span>Submit Application</span>';

    showToast('Application saved & logged to Google Sheets!');
    updateApplicantBadges();
  });
}

function generateAppId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ETE27-CA-${randomNum}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveDraft(form) {
  const formData = new FormData(form);
  const draft = {};
  formData.forEach((val, key) => {
    if (draft[key]) {
      if (!Array.isArray(draft[key])) draft[key] = [draft[key]];
      draft[key].push(val);
    } else {
      draft[key] = val;
    }
  });
  localStorage.setItem('etechnovation_ca_draft', JSON.stringify(draft));
  const autosaveNotice = document.getElementById('autosaveNotice');
  if (autosaveNotice) {
    autosaveNotice.style.opacity = '1';
    autosaveNotice.innerHTML = '<i class="fa-solid fa-check"></i> <span>Draft saved locally</span>';
  }
}

function restoreDraft(form) {
  const saved = localStorage.getItem('etechnovation_ca_draft');
  if (!saved) return;
  try {
    const draft = JSON.parse(saved);
    Object.keys(draft).forEach(key => {
      const el = form.elements[key];
      if (el) {
        if (el.type === 'checkbox') {
          if (Array.isArray(draft[key])) {
            draft[key].forEach(val => {
              const cb = form.querySelector(`input[name="${key}"][value="${val}"]`);
              if (cb) cb.checked = true;
            });
          } else {
            el.checked = true;
          }
        } else {
          el.value = draft[key];
        }
      }
    });
  } catch (e) {
    // ignore parse error
  }
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* ===================================================================
   8. Confetti Celebration
   =================================================================== */
function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff5733', '#14b8a6', '#f59e0b', '#38bdf8']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff5733', '#f59e0b']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#14b8a6', '#38bdf8']
      });
    }, 250);
  }
}

/* ===================================================================
   9. Admin & Reviewer Portal (Storage, Table, Search & CSV Export)
   =================================================================== */
const DEFAULT_APPLICANTS = [
  {
    id: 'ETE27-CA-1042',
    fullName: 'Sazzad Hossain',
    email: 'sazzad.ruet@gmail.com',
    phone: '+880 1712-984210',
    gender: 'Male',
    tshirtSize: 'L',
    institution: 'Rajshahi University of Engineering & Technology (RUET)',
    department: 'Electronics and Telecommunication Engineering (ETE)',
    studyYear: '3rd Year (Undergraduate)',
    studentId: '2109015',
    campusCity: 'Rajshahi',
    facebookUrl: 'https://facebook.com/sazzad.ruet',
    linkedinUrl: 'https://linkedin.com/in/sazzad-ete',
    clubExperience: 'Vice President at RUET Career Forum, Executive at IEEE Student Branch',
    skills: ['Public Speaking', 'Event Management', 'Team Leadership'],
    motivation: 'Being an ETE student at RUET, I want to champion our flagship carnival and represent RUET with the utmost prestige.',
    promotionPlan: 'Forming student delegations across northern engineering colleges and organizing department seminar roadshows.',
    submittedAt: '2026-10-20',
    status: 'Verified'
  },
  {
    id: 'ETE27-CA-1188',
    fullName: 'Anika Tabassum',
    email: 'anika.buet@outlook.com',
    phone: '+880 1819-445522',
    gender: 'Female',
    tshirtSize: 'M',
    institution: 'Bangladesh University of Engineering and Technology (BUET)',
    department: 'Electrical and Electronic Engineering (EEE)',
    studyYear: '2nd Year (Undergraduate)',
    studentId: '2206089',
    campusCity: 'Dhaka',
    facebookUrl: 'https://facebook.com/anika.tabassum',
    linkedinUrl: 'https://linkedin.com/in/anika-buet',
    clubExperience: 'General Member at BUET Robotics Society, Campus Ambassador for Hackathons',
    skills: ['Social Media Marketing', 'Graphic Design / Content', 'Tech & Coding'],
    motivation: 'I want to build a large contingent of BUET students for the robotics, project showcase and line follower challenges at ETEchnovation 2.0.',
    promotionPlan: 'Collaborating with departmental batch representatives and creating viral visual banners for club groups.',
    submittedAt: '2026-10-21',
    status: 'Under Review'
  },
  {
    id: 'ETE27-CA-1234',
    fullName: 'Naimul Islam',
    email: 'naimul.sust@gmail.com',
    phone: '+880 1611-332211',
    gender: 'Male',
    tshirtSize: 'XL',
    institution: 'Shahjalal University of Science and Technology (SUST)',
    department: 'Computer Science and Engineering (CSE)',
    studyYear: '3rd Year (Undergraduate)',
    studentId: '2021331045',
    campusCity: 'Sylhet',
    facebookUrl: 'https://facebook.com/naimul.sust',
    linkedinUrl: 'https://linkedin.com/in/naimul-islam',
    clubExperience: 'Competitive Programmer & Organizer at SUST ACM Chapter',
    skills: ['Public Speaking', 'Tech & Coding', 'Social Media Marketing'],
    motivation: 'Keen to motivate our top coding contest teams to travel to RUET for the National Carnival.',
    promotionPlan: 'Distributing official flyers across Sylhet campuses and conducting online discord sessions.',
    submittedAt: '2026-10-21',
    status: 'Under Review'
  }
];

function getApplicants() {
  const stored = localStorage.getItem('etechnovation_applicants');
  if (!stored) {
    localStorage.setItem('etechnovation_applicants', JSON.stringify(DEFAULT_APPLICANTS));
    return DEFAULT_APPLICANTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_APPLICANTS;
  }
}

function saveApplicant(appObj) {
  const list = getApplicants();
  list.unshift(appObj);
  localStorage.setItem('etechnovation_applicants', JSON.stringify(list));
}

function initAdminPortal() {
  const openAdminBtn = document.getElementById('openAdminBtn');
  const footerAdminLink = document.getElementById('footerAdminLink');
  const mobileDrawerAdminBtn = document.getElementById('mobileDrawerAdminBtn');
  const mobileQuickAdminBtn = document.getElementById('mobileQuickAdminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const resetDemoBtn = document.getElementById('resetDemoBtn');

  function openAdmin() {
    // If mobile drawer was open, close it
    const navLinks = document.getElementById('navLinks');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (navLinks) navLinks.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');

    renderAdminTable();
    openModal(adminModal);
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openAdmin);
  if (footerAdminLink) footerAdminLink.addEventListener('click', openAdmin);
  if (mobileDrawerAdminBtn) mobileDrawerAdminBtn.addEventListener('click', openAdmin);
  if (mobileQuickAdminBtn) mobileQuickAdminBtn.addEventListener('click', openAdmin);
  if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', () => closeModal(adminModal));

  // Keyboard shortcut Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      openAdmin();
    }
  });

  // Secret URL access: ?admin=true or #admin (hidden from public home page)
  if (window.location.search.includes('admin=true') || window.location.hash === '#admin') {
    setTimeout(openAdmin, 400);
  }

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      const query = adminSearchInput.value.toLowerCase().trim();
      renderAdminTable(query);
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportApplicantsToCSV);
  }

  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      const newDemo = {
        id: generateAppId(),
        fullName: 'Mahmudul Hasan',
        email: 'mahmudul@du.ac.bd',
        phone: '+880 1515-778899',
        gender: 'Male',
        tshirtSize: 'M',
        institution: 'University of Dhaka (DU)',
        department: 'Applied Physics & Electronics',
        studyYear: '2nd Year (Undergraduate)',
        studentId: '2022-771',
        campusCity: 'Dhaka',
        facebookUrl: 'https://facebook.com/mahmudul.du',
        linkedinUrl: 'https://linkedin.com/in/mahmudul-du',
        clubExperience: 'Organizer at DU Science Club',
        skills: ['Public Speaking', 'Social Media Marketing'],
        motivation: 'Passionate about connecting Dhaka University delegates with RUET carnival.',
        promotionPlan: 'Distribute posters across Curzon Hall and arrange group transport for participants.',
        submittedAt: new Date().toISOString().split('T')[0],
        status: 'Under Review'
      };
      saveApplicant(newDemo);
      renderAdminTable();
      showToast('Sample applicant added successfully!');
    });
  }

  // Init badge counts
  updateApplicantBadges();
}

function updateApplicantBadges() {
  const list = getApplicants();
  const badge = document.getElementById('applicantCountBadge');
  const drawerBadge = document.getElementById('drawerApplicantCountBadge');
  const mobileQuickBadge = document.getElementById('mobileQuickCountBadge');
  const totalCountEl = document.getElementById('totalApplicantsCount');
  const uniqueInstEl = document.getElementById('uniqueInstitutionsCount');

  if (badge) badge.textContent = list.length;
  if (drawerBadge) drawerBadge.textContent = list.length;
  if (mobileQuickBadge) mobileQuickBadge.textContent = list.length;
  if (totalCountEl) totalCountEl.textContent = list.length;

  if (uniqueInstEl) {
    const unique = new Set(list.map(a => a.institution.trim().toLowerCase()));
    uniqueInstEl.textContent = unique.size;
  }
}

function renderAdminTable(filterQuery = '') {
  const tbody = document.getElementById('applicantsTableBody');
  if (!tbody) return;

  const list = getApplicants();
  updateApplicantBadges();

  const filtered = list.filter(item => {
    if (!filterQuery) return true;
    const searchString = `${item.id} ${item.fullName} ${item.institution} ${item.department} ${item.email} ${item.phone}`.toLowerCase();
    return searchString.includes(filterQuery);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No applicants match your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(app => `
    <tr>
      <td><span class="code-val">${escapeHtml(app.id)}</span></td>
      <td>
        <strong>${escapeHtml(app.fullName)}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(app.email)}</div>
      </td>
      <td>${escapeHtml(app.institution)}</td>
      <td>${escapeHtml(app.department)} <br><span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(app.studyYear)}</span></td>
      <td>${escapeHtml(app.phone)}</td>
      <td>${escapeHtml(app.submittedAt)}</td>
      <td>
        <button class="action-row-btn" onclick="viewApplicantDetails('${app.id}')">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    </tr>
  `).join('');
}

// Window scoped for inline onclick
window.viewApplicantDetails = function(appId) {
  const list = getApplicants();
  const applicant = list.find(a => a.id === appId);
  if (!applicant) return;

  const detailModal = document.getElementById('detailModal');
  const detailBody = document.getElementById('detailModalBody');

  const skillsHtml = (applicant.skills || []).map(s => `
    <span class="perk-pill" style="display:inline-block; margin-right:4px; margin-bottom:4px;">${escapeHtml(s)}</span>
  `).join('') || 'None specified';

  detailBody.innerHTML = `
    <div class="detail-section">
      <h4>Personal & Contact Information</h4>
      <div class="detail-grid">
        <div class="detail-item"><label>Application ID</label><p class="code-val">${escapeHtml(applicant.id)}</p></div>
        <div class="detail-item"><label>Full Name</label><p>${escapeHtml(applicant.fullName)}</p></div>
        <div class="detail-item"><label>Email</label><p>${escapeHtml(applicant.email)}</p></div>
        <div class="detail-item"><label>Phone / WhatsApp</label><p>${escapeHtml(applicant.phone)}</p></div>
        <div class="detail-item"><label>Gender</label><p>${escapeHtml(applicant.gender)}</p></div>
        <div class="detail-item"><label>T-Shirt Size</label><p>${escapeHtml(applicant.tshirtSize)}</p></div>
      </div>
    </div>

    <div class="detail-section">
      <h4>Academic Credentials</h4>
      <div class="detail-grid">
        <div class="detail-item"><label>Institution</label><p>${escapeHtml(applicant.institution)}</p></div>
        <div class="detail-item"><label>Department</label><p>${escapeHtml(applicant.department)}</p></div>
        <div class="detail-item"><label>Year / Stage</label><p>${escapeHtml(applicant.studyYear)}</p></div>
        <div class="detail-item"><label>Student ID</label><p>${escapeHtml(applicant.studentId)}</p></div>
        <div class="detail-item"><label>Campus City</label><p>${escapeHtml(applicant.campusCity)}</p></div>
      </div>
    </div>

    <div class="detail-section">
      <h4>Social Links & Skills</h4>
      <div class="detail-grid">
        <div class="detail-item"><label>Facebook</label><p><a href="${escapeHtml(applicant.facebookUrl)}" target="_blank" style="color:var(--brand-orange); text-decoration:underline;">View Profile <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p></div>
        <div class="detail-item"><label>LinkedIn</label><p>${applicant.linkedinUrl !== 'N/A' ? `<a href="${escapeHtml(applicant.linkedinUrl)}" target="_blank" style="color:var(--brand-orange); text-decoration:underline;">View LinkedIn</a>` : 'Not provided'}</p></div>
      </div>
      <div style="margin-top: 1rem;">
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Key Skills</label>
        <div>${skillsHtml}</div>
      </div>
      <div style="margin-top: 1rem;">
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Past Leadership / Club Experience</label>
        <p style="font-size:0.9rem; line-height:1.5;">${escapeHtml(applicant.clubExperience)}</p>
      </div>
    </div>

    <div class="detail-section" style="border-bottom: none;">
      <h4>Motivation & Promotion Plan</h4>
      <div style="margin-bottom: 1rem;">
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Why ETEchnovation 2.0?</label>
        <p style="font-size:0.92rem; line-height:1.6; background:var(--bg-tertiary); padding:0.8rem; border-radius:8px;">${escapeHtml(applicant.motivation)}</p>
      </div>
      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Campus Promotion Strategy</label>
        <p style="font-size:0.92rem; line-height:1.6; background:var(--bg-tertiary); padding:0.8rem; border-radius:8px;">${escapeHtml(applicant.promotionPlan)}</p>
      </div>
    </div>
  `;

  const closeDetailBtn = document.getElementById('closeDetailModalBtn');
  if (closeDetailBtn) {
    closeDetailBtn.onclick = () => closeModal(detailModal);
  }

  openModal(detailModal);
};

/* ===================================================================
   10. CSV Export
   =================================================================== */
function exportApplicantsToCSV() {
  const applicants = getApplicants();
  if (applicants.length === 0) {
    showToast('No applications to export');
    return;
  }

  const headers = [
    'Application ID',
    'Full Name',
    'Email',
    'Phone',
    'Gender',
    'T-Shirt Size',
    'Institution',
    'Department',
    'Study Year',
    'Student ID',
    'Campus City',
    'Facebook URL',
    'LinkedIn URL',
    'Skills',
    'Past Club Experience',
    'Motivation',
    'Promotion Plan',
    'Submission Date',
    'Status'
  ];

  const csvRows = [];
  csvRows.push(headers.join(','));

  applicants.forEach(app => {
    const row = [
      escapeCsvField(app.id),
      escapeCsvField(app.fullName),
      escapeCsvField(app.email),
      escapeCsvField(app.phone),
      escapeCsvField(app.gender),
      escapeCsvField(app.tshirtSize),
      escapeCsvField(app.institution),
      escapeCsvField(app.department),
      escapeCsvField(app.studyYear),
      escapeCsvField(app.studentId),
      escapeCsvField(app.campusCity),
      escapeCsvField(app.facebookUrl),
      escapeCsvField(app.linkedinUrl),
      escapeCsvField((app.skills || []).join('; ')),
      escapeCsvField(app.clubExperience),
      escapeCsvField(app.motivation),
      escapeCsvField(app.promotionPlan),
      escapeCsvField(app.submittedAt),
      escapeCsvField(app.status)
    ];
    csvRows.push(row.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\r\n'); // Include BOM for Excel UTF-8 support
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ETEchnovation_2.0_Ambassadors_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Exported CSV spreadsheet successfully!');
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===================================================================
   11. Toast Notifications
   =================================================================== */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-info" style="color:var(--brand-teal);"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 4000);
}
