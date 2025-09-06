/* ===== Helpers ===== */
const SG = {
  moneyToNumber(txt){
    // Extract first number in string (supports $ £ € and commas)
    const m = (txt || '').match(/([£$€])?\s?([\d,]+(\.\d+)?)/);
    if(!m) return null;
    return parseFloat(m[2].replace(/,/g,''));
  },
  toast(msg){
    const box = document.createElement('div');
    box.className = 'notice'; box.setAttribute('role','status'); box.textContent = msg;
    document.querySelector('main')?.prepend(box);
    setTimeout(()=> box.remove(), 3500);
  },
  uid(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }
};

$(function(){

  /* ===== Nav: set current link active via pathname ===== */
  const here = location.pathname.split('/').pop() || 'index.html';
  $('.nav a').each(function(){
    if (this.getAttribute('href').endsWith(here)) $(this).addClass('badge');
  });

  /* ===== COURSES PAGE LOGIC ===== */
  if ($('#course-list').length){

    // 1) Country filter
    $('#country-select').on('change', function(){
      const country = this.value;
      $('.course-card').each(function(){
        const show = country === 'all' || $(this).data('country') === country;
        show ? $(this).slideDown(120) : $(this).slideUp(120);
      });
    });

    // 2) Search by university name
    $('#search').on('input', function(){
      const q = this.value.toLowerCase().trim();
      $('.course-card').each(function(){
        const name = $(this).find('h2').text().toLowerCase();
        $(this).toggle(name.includes(q));
      });
    });

    // 3) Sort by tuition (ascending/descending) based on Bachelor tuition in details
    $('#sort').on('change', function(){
      const dir = this.value; // asc|desc|none
      const $cards = $('.course-card');
      if (dir === 'none') { $('#course-list').html($cards); return; }

      const sorted = $cards.get().sort((a,b)=>{
        const atxt = $(a).find('.details p:contains("Tuition")').first().text();
        const btxt = $(b).find('.details p:contains("Tuition")').first().text();
        const an = SG.moneyToNumber(atxt) ?? Infinity;
        const bn = SG.moneyToNumber(btxt) ?? Infinity;
        return dir === 'asc' ? (an - bn) : (bn - an);
      });
      $('#course-list').html(sorted);
    });

    // 4) Toggle details + a11y
    $('.details-btn').on('click', function(){
      const $btn = $(this);
      const $detail = $btn.siblings('.details');
      const expanded = $btn.attr('aria-expanded') === 'true';
      $btn.attr('aria-expanded', !expanded);
      $detail.slideToggle(150);
    });
    // Keyboard trigger
    $('.details-btn').on('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).click(); }
    });

    // 5) Favourites with localStorage
    const KEY = 'sg_favs';
    function loadFavs(){ try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }
    function saveFavs(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
    function paintFavs(){
      const favs = new Set(loadFavs());
      $('.course-card').each(function(){
        const id = this.id || (this.id = 'card_' + SG.uid());
        $(this).find('.fav-btn').remove();
        const btn = $(`<button type="button" class="fav-btn" aria-pressed="${favs.has(id)}" title="Save to favourites">⭐</button>`)
          .css({ float:'right', background:'transparent', color:'#222' });
        $(this).prepend(btn);
        btn.on('click', ()=>{
          const list = loadFavs();
          const i = list.indexOf(id);
          if (i === -1) list.push(id); else list.splice(i,1);
          saveFavs(list);
          btn.attr('aria-pressed', i === -1);
          SG.toast(i === -1 ? 'Added to favourites' : 'Removed from favourites');
          renderFavList();
        });
      });
    }
    function renderFavList(){
      const favs = new Set(loadFavs());
      let $section = $('#favs');
      if (!$section.length){
        $('#course-filter').after('<section id="favs"><h2>My Favourites</h2><div id="fav-wrap" class="grid"></div></section>');
        $section = $('#favs');
      }
      const $wrap = $('#fav-wrap').empty();
      $('.course-card').each(function(){
        if (favs.has(this.id)) $wrap.append($(this).clone(true, true));
      });
      if (!favs.size) $section.hide(); else $section.show();
    }
    paintFavs(); renderFavList();
  }

  /* ===== CONTACT PAGE LOGIC ===== */
  if ($('#contact-form').length){

    // Prefill from localStorage
    ['name','email','phone','interest','intake','method_email','method_phone','message','consent']
      .forEach(id=>{
        const val = localStorage.getItem('contact_' + id);
        if (val === null) return;
        const $el = $('#' + id);
        if ($el.is(':checkbox') || $el.is(':radio')) {
          if (val === 'true') $el.prop('checked', true);
        } else $el.val(val);
      });

    $('#contact-form input, #contact-form select, #contact-form textarea').on('input change', function(){
      const id = this.id;
      const value = ($(this).is(':checkbox') || $(this).is(':radio')) ? String($(this).prop('checked')) : $(this).val();
      localStorage.setItem('contact_' + id, value);
    });

    // Live validation helpers
    const mailre = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonere = /^[0-9 +()-]{7,20}$/;

    function setError($el, msg){
      $el.attr('aria-invalid','true');
      $el.next('.error').text(msg).show();
    }
    function clearError($el){
      $el.removeAttr('aria-invalid');
      $el.next('.error').hide();
    }

    $('#name').on('blur', function(){
      this.value.trim() ? clearError($(this)) : setError($(this), 'Please enter your name.');
    });
    $('#email').on('blur', function(){
      mailre.test(this.value) ? clearError($(this)) : setError($(this), 'Enter a valid email address.');
    });
    $('#phone').on('blur', function(){
      if (!this.value.trim()) return clearError($(this)); // optional
      phonere.test(this.value) ? clearError($(this)) : setError($(this), 'Enter a valid phone number.');
    });
    $('#consent').on('change', function(){
      this.checked ? clearError($(this)) : setError($(this), 'You must agree before sending.');
    });

    // Submit
    $('#contact-form').on('submit', function(e){
      e.preventDefault();
      const errors = [];

      const $name = $('#name');
      if (!$name.val().trim()) { errors.push('Enter your name'); setError($name, 'Please enter your name.'); } else clearError($name);

      const $email = $('#email');
      if (!mailre.test($email.val())) { errors.push('Enter a valid email'); setError($email, 'Enter a valid email address.'); } else clearError($email);

      const $phone = $('#phone');
      if ($phone.val().trim() && !phonere.test($phone.val())) { errors.push('Check your phone number'); setError($phone, 'Enter a valid phone number.'); } else clearError($phone);

      const $consent = $('#consent');
      if (!$consent.prop('checked')) { errors.push('Agree to privacy terms'); setError($consent, 'You must agree before sending.'); } else clearError($consent);

      if (errors.length){
        $('#error-summary').html('<h2>Fix the following:</h2><ul>' + errors.map(e=>`<li>${e}</li>`).join('') + '</ul>').show().focus();
        return;
      } else {
        $('#error-summary').hide().empty();
      }

      // Create a tracking ID and render enquiry to page
      const data = {
        id: 'ENQ-' + SG.uid(),
        name: $('#name').val().trim(),
        email: $('#email').val().trim(),
        phone: $('#phone').val().trim(),
        interest: $('#interest').val() || 'N/A',
        intake: $('input[name="intake"]:checked').val() || 'N/A',
        method: $('input[name="method"]:checked').val() || 'Email',
        message: $('#message').val().trim()
      };

      if (!$('#recent-enquiries').length){
        $('#contact').append('<h2>Recent enquiries</h2><ul id="recent-enquiries"></ul>');
      }
      $('#recent-enquiries').prepend(
        `<li><strong>${data.name}</strong> (${data.email}${data.phone ? ', ' + data.phone : ''})<br>
          Interest: ${data.interest} • Intake: ${data.intake} • Contact via: ${data.method}<br>
          <em>${data.message || '—'}</em><br><span class="badge">${data.id}</span></li>`
      );

      // Clear only contact_* keys
      Object.keys(localStorage).forEach(k=>{ if (k.startsWith('contact_')) localStorage.removeItem(k); });

      this.reset();
      SG.toast(`Thanks! Your message has been sent. Tracking ID: ${data.id}`);
    });

    // Live clock
    setInterval(()=> { $('#time').text(new Date().toLocaleString()); }, 1000);

    // Currency converter (simple static rates)
    const rates = { GBP:1, USD:1.28, EUR:1.17, CAD:1.75, AUD:1.95 }; // 1 GBP in others (adjust as needed)
    function convertTuition(amountGBP, target){
      return (amountGBP * (rates[target] || 1)).toFixed(0);
    }
    $('#cc_amount, #cc_target').on('input change', function(){
      const gbp = parseFloat($('#cc_amount').val());
      const t = $('#cc_target').val();
      if (!isNaN(gbp)) $('#cc_result').text(`${convertTuition(gbp, t)} ${t}`);
      else $('#cc_result').text('—');
    });
  }

  /* ===== INFO PAGE: animated reveal ===== */
  if ($('#regions').length){
    $('.chip').on('click keydown', function(e){
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        const id = $(this).data('target');
        const $panel = $('#'+id);
        $panel.is(':visible') ? $panel.slideUp(150) : $panel.slideDown(150);
      }
    });

    $('#reveal-all').on('click', function(){
      $('.info-panel:hidden').each(function(i){
        $(this).delay(120*i).slideDown(160);
      });
    });
  }

});

function playNext() {
  bgVideo.classList.add("fade-out");

  setTimeout(() => {
    const nextSrc = videoList[currentVideo];
    bgVideo.src = nextSrc;
    bgVideo.load();

    bgVideo.oncanplaythrough = () => {
      bgVideo.classList.remove("fade-out");
      bgVideo.play();
    };

    bgVideo.onerror = () => {
      console.error("Error loading video:", nextSrc);
      currentVideo = (currentVideo + 1) % videoList.length;
      playNext();
    };

    currentVideo = (currentVideo + 1) % videoList.length;
  }, 1000); // Match fade duration
}

//Breathe Feature- course expantion
