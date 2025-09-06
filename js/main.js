document.addEventListener("DOMContentLoaded", () => {
  // AOS Init
  AOS.init({
    duration: 1000,
    once: true
  });

  //  Display current date
  const dateEl = document.getElementById("currentDate");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString();
  }



  // Hero Slider
  const heroSlides = document.querySelectorAll(".slide");
  let currentHero = 0;

  if (heroSlides.length > 0) {
  setInterval(() => {
    heroSlides[currentHero].classList.remove("active");
    currentHero = (currentHero + 1) % heroSlides.length;
    heroSlides[currentHero].classList.add("active");
  }, 4000);
}


  // Bookshelf Modal Feature
  const books = document.querySelectorAll(".book-card");
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  document.body.appendChild(modalOverlay);

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modalOverlay.appendChild(modal);

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("close-btn");
  closeBtn.innerHTML = "&times;";
  modal.appendChild(closeBtn);

  const modalContent = document.createElement("div");
  modal.appendChild(modalContent);

  closeBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  books.forEach(book => {
    book.addEventListener("click", () => {
      const title = book.getAttribute("data-title") || "Book Title";
      const description = book.getAttribute("data-description") || "No description available.";
      modalContent.innerHTML = `<h2>${title}</h2><p>${description}</p>`;
      modalOverlay.style.display = "flex";
    });
  });

  // Tab System
  // Remove toggle behavior — both sections stay visible
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.classList.add("active"); // Always active
});

// Show both tab contents
document.querySelectorAll(".tab-content").forEach(content => {
  content.classList.add("active"); // Always visible
});

  // Scroll-triggered Outro Animation 
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.country-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardBottom = rect.bottom;
      const viewportHeight = window.innerHeight;

      if (cardBottom < viewportHeight - 50) {
        card.classList.add('outro');
      } else {
        card.classList.remove('outro');
      }
    });
  });

  // Journal Slider Enhancements
  const sliders = document.querySelectorAll('.slider-track');

  sliders.forEach(slider => {
    // Make focusable
    slider.setAttribute('tabindex', '0');

    // Keyboard navigation
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        this.scrollLeft += 300;
      } else if (e.key === 'ArrowLeft') {
        this.scrollLeft -= 300;
      }
    });

    // Optional: smooth scroll (already CSS based)
  });

});

//Search Bar feature
$(document).ready(function () {
  const $input = $('#site-search-input');
  const $results = $('#search-results');
  let selectedIndex = -1; // for keyboard navigation

  // Your searchable data
  const searchMap = [
    { title: 'UK Scholarships', keywords: 'uk chevening undergraduate masters', link: 'exploration.html#uk' },
    { title: 'USA Programs', keywords: 'usa undergrad courses', link: 'exploration.html#usa' },
    { title: 'FAQ Visa', keywords: 'faq visa application', link: 'faq.html#visa' },
    { title: 'Contact Info', keywords: 'contact email phone office', link: 'contact.html' },
    { title: 'Courses', keywords: 'computing business medical', link: 'courses.html' },
    // add more as needed
  ];

  // Fuzzy search helper: checks if pattern loosely matches text
  // Simple fuzzy search: all characters appear in order (not necessarily consecutive)
  function fuzzyMatch(text, pattern) {
    text = text.toLowerCase();
    pattern = pattern.toLowerCase();
    let tIndex = 0, pIndex = 0;
    while (tIndex < text.length && pIndex < pattern.length) {
      if (text[tIndex] === pattern[pIndex]) pIndex++;
      tIndex++;
    }
    return pIndex === pattern.length;
  }

  // Highlight all occurrences of chars in pattern (in order) in the text for better UX
  function highlightFuzzy(text, pattern) {
    if (!pattern) return text;
    let t = text.toLowerCase();
    let p = pattern.toLowerCase();

    let result = '';
    let pIndex = 0;

    for (let i = 0; i < text.length; i++) {
      if (pIndex < p.length && t[i] === p[pIndex]) {
        result += `<span class="highlight">${text[i]}</span>`;
        pIndex++;
      } else {
        result += text[i];
      }
    }
    return result;
  }

  // Render suggestions list
  function renderResults(matches, query) {
    $results.empty();
    selectedIndex = -1;

    if (matches.length === 0) {
      $results.append(
        `<li role="option" data-external="1" tabindex="-1" aria-selected="false">
          Search Google for "<strong>${escapeHtml(query)}</strong>"
        </li>`
      );
      $results.addClass('visible');
      $input.attr('aria-expanded', 'true');
      return;
    }

    matches.forEach((item, i) => {
      const highlighted = highlightFuzzy(item.title, query);
      $results.append(
        `<li role="option" data-link="${item.link}" tabindex="-1" aria-selected="false">${highlighted}</li>`
      );
    });

    $results.addClass('visible');
    $input.attr('aria-expanded', 'true');
  }

  // Escape html helper
  function escapeHtml(text) {
    return text.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;',
        '=': '&#61;',
        '/': '&#47;'
      })[s];
    });
  }

  // Keyboard navigation
  function updateSelection(newIndex) {
    const items = $results.children('li');
    if (items.length === 0) return;

    if (newIndex < 0) newIndex = items.length - 1;
    else if (newIndex >= items.length) newIndex = 0;

    items.attr('aria-selected', 'false').removeClass('active');
    const $item = items.eq(newIndex);
    $item.attr('aria-selected', 'true').addClass('active');

    $input.attr('aria-activedescendant', `result-item-${newIndex}`);
    $item.attr('id', `result-item-${newIndex}`);

    selectedIndex = newIndex;
  }

  // Scroll to internal section smoothly if exists
  function scrollToAnchor(url) {
    const anchorIndex = url.indexOf('#');
    if (anchorIndex !== -1) {
      const anchor = url.slice(anchorIndex + 1);
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', url); // update URL without reload
        return true;
      }
    }
    return false;
  }

  // Main input handler
  $input.on('input', function () {
    const query = $(this).val().toLowerCase().trim();

    if (!query) {
      $results.empty().removeClass('visible');
      $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      selectedIndex = -1;
      return;
    }

    // Filter with fuzzy match on title or keywords
    const matches = searchMap.filter(item =>
      fuzzyMatch(item.title, query) || fuzzyMatch(item.keywords, query)
    );

    renderResults(matches, query);
  });

  // Keyboard handling (up/down arrows + enter + esc)
  $input.on('keydown', function (e) {
    const items = $results.children('li');
    if (!$results.hasClass('visible') || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        updateSelection(selectedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        updateSelection(selectedIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex < 0) return;

        const $sel = items.eq(selectedIndex);
        if ($sel.data('external')) {
          const q = $input.val();
          window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        } else {
          const link = $sel.data('link');
          if (link) {
            if (!scrollToAnchor(link)) {
              window.location.href = link;
            }
          }
        }
        $results.removeClass('visible').empty();
        $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
        selectedIndex = -1;
        break;
      case 'Escape':
        $results.removeClass('visible').empty();
        $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
        selectedIndex = -1;
        break;
    }
  });

  // Clicking on suggestion items
  $results.on('click', 'li', function () {
    const $this = $(this);
    if ($this.data('external')) {
      const q = $input.val();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    } else {
      const link = $this.data('link');
      if (link) {
        if (!scrollToAnchor(link)) {
          window.location.href = link;
        }
      }
    }
    $results.removeClass('visible').empty();
    $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
    selectedIndex = -1;
  });

  // Clicking outside closes search suggestions
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.global-search').length) {
      $results.removeClass('visible').empty();
      $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      selectedIndex = -1;
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.querySelector('.global-search');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      searchBar.classList.add('hidden');
    } else {
      // Scrolling up or near top
      searchBar.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
  });
});
// Notice Board
const messages = [
  { text: "Advanced IELTS Tips Released!", url: "file:///C:/scholars-guild/resources.html" },
  { text: "Duolingo Sprint Add-on Now Live!", url: "https://example.com/duolingo-sprint" },
  { text: "CV & SOP Polishing Session Open!", url: "https://example.com/cv-sop-polishing" },
  { text: "Crash Course: UK Visa Simplified!", url: "https://example.com/uk-visa-crash-course" },
  { text: "New Country: Austria Opportunities!", url: "https://example.com/sweden-opportunities" }
];

let msgIndex = 0;
const front = document.getElementById('flip-front');
const back = document.getElementById('flip-back');
const flipInner = document.getElementById('flip-inner');

function updateMessage() {
  const { text, url, action } = messages[msgIndex];
  const isInternal = url.startsWith("#");

  const link = document.createElement("a");
  link.textContent = text;
  link.style.textDecoration = "none";
  link.style.color = "inherit";
  link.style.cursor = "pointer";

  if (isInternal && typeof action === "function") {
    link.onclick = action;
  } else {
    link.href = url;
    link.target = "_blank";
  }

  if (flipInner.classList.contains("flip")) {
    back.innerHTML = "";
    back.appendChild(link);
  } else {
    front.innerHTML = "";
    front.appendChild(link);
  }
}


setInterval(() => {
  msgIndex = (msgIndex + 1) % messages.length;
  flipInner.classList.toggle('flip');
  updateMessage();
}, 4000);

// Initialize first message
updateMessage();


//Typewriter-Box//
const typeMessages = [
  "New: Visa Interview Simulator Added.",
  "Just Released: Letter of Motivation Templates.",
  "Internship Matching Available Now.",
  "Explore Netherlands: Fall 2026 Open!"
];

let tmIndex = 0;
let charIndex = 0;
const box = document.getElementById("typewriter-box");

function typeEffect() {
  if (charIndex < typeMessages[tmIndex].length) {
    box.textContent += typeMessages[tmIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeEffect, 60);
  } else {
    setTimeout(() => {
      box.textContent = '';
      charIndex = 0;
      tmIndex = (tmIndex + 1) % typeMessages.length;
      typeEffect();
    }, 2000);
  }
}
typeEffect();

document.addEventListener("DOMContentLoaded", function () {
 // --- Background Video Slideshow ---
  const videoPaths = [
    "images/live-image.mp4",
    "images/live-image1.mp4",
    "images/live-image2.mp4",
    "images/live-image3.mp4",
    "images/live-image4.mp4"
  ];
  let currentVideoIndex = 0;
  const bgVideoElement = document.getElementById("bgVideo");

  function playVideo(index) {
    if (!bgVideoElement) return;
    bgVideoElement.src = videoPaths[index];
    bgVideoElement.load();
    bgVideoElement.play().catch(()=>{}); //catcha and ignore
  }

  if (bgVideoElement) {
    playVideo(currentVideoIndex);

    bgVideoElement.addEventListener("ended", () => {
      currentVideoIndex = (currentVideoIndex + 1) % videoPaths.length;
      playVideo(currentVideoIndex);
    });
  }
});

//Pop-up feature for unis
// Open Modal
document.querySelectorAll('[data-modal-target]').forEach(card => {
  card.addEventListener('click', () => {
    const modalId = card.getAttribute('data-modal-target');
    const modal = document.querySelector(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
  });
});

// Close Modal
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.country-modal-overlay');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scroll
  });
});

// Tab Switching
document.querySelectorAll('.country-modal-overlay').forEach(modal => {
  const tabs = modal.querySelectorAll('.modal-tab');
  const contents = modal.querySelectorAll('.modal-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(c => {
        c.classList.remove('active');
        if (c.id === targetId) c.classList.add('active');
      });
    });
  });
});

// Optional: Close modal when clicking outside the box
document.querySelectorAll('.country-modal-overlay').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});

//Course Tab pop-up
// Open modal (trigger this from your card button)
document.querySelectorAll('.explore-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetModal = document.getElementById('ieltsSlingshotModal');
    if (targetModal) targetModal.style.display = 'flex';
  });
});

// Close modal
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.course-modal-overlay').style.display = 'none';
  });
});

// Tab switching logic
document.querySelectorAll('.course-modal-overlay').forEach(modal => {
  const tabs = modal.querySelectorAll('.course-tab');
  const contents = modal.querySelectorAll('.course-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(c => {
        c.classList.remove('active');
        if (c.id === targetId) c.classList.add('active');
      });
    });
  });
});

//Cookie-Policy

SetCookie = (cName, cValue, expDays) => {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + ";" + expires + "; path=/, path=/contact";
}

getCookie = (cName) => {
  const name = cName + "=";
  const cDecoded = decodedURIComponent(document.cookies);
  const cArr = cDecoded.split("; ");
  let value;
  cArr.forEach(val => {
    if(val.indexOf(name) === 0) value = val.substring(name.length);
  })
  return value;
}
document.querySelector("#cookies-btn").addEventListener("click",()=>{
  document.querySelector("#cookies").style.display = "none";
  setCookies("cookie", true, 1);
})

cookieMessage = () => {
  if(!getCookie('cookie'))
    document.querySelector("#cookies").style.display = "block";
}

window.addEventListener("load", cookieMessage);

