// ===== Small helper for a nicer success message
const SG = {
  toast(msg){
    const n = document.createElement('div');
    n.className = 'notice';
    n.setAttribute('role','status');
    n.textContent = msg;
    document.querySelector('main').prepend(n);
    setTimeout(()=> n.remove(), 3000);
  }
};

$(function(){

  // ===== COURSES PAGE logic (runs only if #course-list exists)
  if ($('#course-list').length){

    // Apply filter initially and on change
    const applyFilter = () => {
      const c = $('#country-select').val();
      $('.course-card').each(function(){
        const show = c === 'all' || $(this).data('country') === c;
        $(this).toggle(show);
      });
    };
    $('#country-select').on('change', applyFilter);
    applyFilter();

    // Toggle details with click
    $('.details-btn').on('click', function(){
      const $btn = $(this);
      const $detail = $btn.siblings('.details');
      const expanded = $btn.attr('aria-expanded') === 'true';
      $btn.attr('aria-expanded', !expanded);
      $detail.slideToggle(150);
    });

    // Keyboard support on headings (Enter/Space toggles)
    $('#course-list h2[tabindex]').on('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).siblings('.details-btn').trigger('click');
      }
    });
  }

  // ===== CONTACT PAGE logic (runs only if #contact-form exists)
  if ($('#contact-form').length){

    // Prefill from localStorage
    ['name','email','interest','message'].forEach(id=>{
      const v = localStorage.getItem('contact_' + id);
      if (v) $('#' + id).val(v);
    });
    $('#contact-form input, #contact-form select, #contact-form textarea')
      .on('input change', function(){
        if (this.id) localStorage.setItem('contact_' + this.id, $(this).val());
      });

    // Live character counter
    const updateCount = () => {
      $('#msg-count').text(($('#message').val() || '').length);
    };
    $('#message').on('input', updateCount);
    updateCount();

    // Live clock
    setInterval(()=> $('#time').text(new Date().toLocaleString()), 1000);

    // Validate + submit
    $('#contact-form').on('submit', function(e){
      e.preventDefault();

      // Honeypot: if filled, silently stop
      if ($('#company').val()) return;

      let ok = true;
      const mailre = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const $name = $('#name');
      if (!$name.val().trim()){
        ok = false;
        $name.next('.error').text('Please enter your name.').show();
      } else $name.next('.error').text('');

      const $email = $('#email');
      if (!mailre.test($email.val())){
        ok = false;
        $email.next('.error').text('Enter a valid email.').show();
      } else $email.next('.error').text('');

      const $consent = $('#consent');
      if (!$consent.is(':checked')){
        ok = false;
        $consent.closest('.field').find('.error').text('You must agree to be contacted.').show();
      } else $consent.closest('.field').find('.error').text('');

      // optional: attachment size/type check
      const $file = $('#attachment');
      const file = $file[0].files[0];
      if (file){
        const okTypes = ['application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg','image/png'];
        if (!okTypes.includes(file.type) || file.size > 5*1024*1024){
          ok = false;
          $file.nextAll('.error:first').text('File must be PDF/DOC/DOCX/JPG/PNG and under 5MB.');
        } else {
          $file.nextAll('.error:first').text('');
        }
      }

      // Error summary
      const errors = [];
      $('#contact-form .error').each(function(){
        if ($(this).text().trim()){
          const fieldId = $(this).prevAll('input,select,textarea').attr('id');
          const label = $(this).prevAll('label:first').text().replace('*','').trim() || fieldId;
          errors.push({id: fieldId, label, msg: $(this).text().trim()});
        }
      });
      if (!ok){
        if (errors.length){
          const list = errors.map(e => `<li><a href="#${e.id}">${e.label}:</a> ${e.msg}</li>`).join('');
          $('#error-summary').removeClass('visually-hidden')
            .html(`<strong>Please fix the following:</strong><ul>${list}</ul>`).focus();
        }
        return;
      } else {
        $('#error-summary').addClass('visually-hidden').empty();
      }

      // Success
      SG.toast('Thanks! Your message has been sent.');
      const summary = {
        name: $('#name').val(),
        email: $('#email').val(),
        interest: $('#interest').val(),
        date: new Date().toLocaleString()
      };

      // Append to "Recent enquiries"
      $('#enquiry-list').prepend(
        `<li><div><strong>${summary.name}</strong> — ${summary.email}<br><small>${summary.date}</small></div><div>${summary.interest || ''}</div></li>`
      );

      // Clear only contact_* keys
      Object.keys(localStorage).forEach(k => { if (k.startsWith('contact_')) localStorage.removeItem(k); });

      // Reset form + counters
      this.reset();
      updateCount();
    });
  }

});
