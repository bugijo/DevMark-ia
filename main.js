const FORM_ENDPOINT_BASE = 'https://formsubmit.co/ajax/';

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initFormSubmit();
  initCalculator();
});

function initFormSubmit() {
  const forms = document.querySelectorAll('form[data-formsubmit]');
  if (!forms.length) {
    return;
  }

  forms.forEach((form) => {
    const targetEmail = form.dataset.formsubmit;
    const feedback = form.querySelector('.form-feedback');
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = form.dataset.success || 'Recebemos seus dados! Em breve entraremos em contato.';
    const errorMessage = form.dataset.error || 'Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.';
    const subject = form.dataset.subject || 'Novo lead DevMark ia';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!targetEmail) {
        return;
      }

      const formData = new FormData(form);
      formData.append('_subject', subject);
      formData.append('_template', 'table');
      const payload = Object.fromEntries(formData.entries());

      try {
        if (submitButton) {
          submitButton.disabled = true;
        }
        if (feedback) {
          feedback.textContent = 'Enviando...';
          feedback.classList.remove('is-error', 'is-success');
        }

        const response = await fetch(`${FORM_ENDPOINT_BASE}${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Resposta inválida do serviço de formulários.');
        }

        if (feedback) {
          feedback.textContent = successMessage;
          feedback.classList.add('is-success');
        }
        form.reset();
      } catch (error) {
        if (feedback) {
          feedback.textContent = errorMessage;
          feedback.classList.add('is-error');
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });
}

function initCalculator() {
  const hoursInput = document.getElementById('horas');
  const costInput = document.getElementById('custo');
  const efficiencyInput = document.getElementById('eficiencia');
  const hoursOutput = document.getElementById('resultado-horas');
  const moneyOutput = document.getElementById('resultado-dinheiro');

  if (!hoursInput || !costInput || !efficiencyInput || !hoursOutput || !moneyOutput) {
    return;
  }

  const formatCurrency = (value) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const updateCalculator = () => {
    const hours = Math.max(0, Number(hoursInput.value));
    const cost = Math.max(0, Number(costInput.value));
    const efficiency = Math.min(100, Math.max(0, Number(efficiencyInput.value)));

    const savedHours = hours * (efficiency / 100);
    const savedMoney = savedHours * cost;

    hoursOutput.textContent = savedHours.toFixed(1);
    moneyOutput.textContent = formatCurrency(savedMoney);
  };

  [hoursInput, costInput, efficiencyInput].forEach((input) => {
    input.addEventListener('input', updateCalculator);
  });

  updateCalculator();
}
