const SERVICE_ID = 'service_lao0vzh'
const TEMPLATE_ID = 'template_owcsvqr'
const PUBLIC_KEY = 'TbMuuhDP2gCfEc2tQ'

/**
 * Відправка  листа через EmailJS API
 * @param {string} toEmail - Пошта отримувача
 * @param {object} templateParams - Параметри, які чекає шаблон (імена, тексти)
 */
export const sendRealEmail = async (toEmail, templateParams) => {
  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: {
      to_email: toEmail,
      ...templateParams,
    },
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`EmailJS Response Error: ${errorText}`)
    }

    return true
  } catch (error) {
    console.error('Не вдалося надіслати лист:', error)
    return false
  }
}
