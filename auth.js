var supabase = window.supabase.createClient(
  'https://qwxpkqianfmmkfkborte.supabase.co',
  'sb_publishable_JrhMTIZA0ZYje7EglqT3sg_nfbwwc7o'
)

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    checkAccess()
  } else {
    showAuthScreen()
  }
})

async function checkAccess() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { showAuthScreen(); return }

  const { data } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    await supabase.from('user_access').insert({ user_id: user.id })
    startTrial()
    return
  }

  if (data.paid) { fullAccess(); return }
  if (new Date() < new Date(data.trial_ends_at)) { startTrial(data.trial_ends_at); return }

  showPaywall()
}

function showAuthScreen() {
  if (document.getElementById('auth-overlay')) return
  const overlay = document.createElement('div')
  overlay.id = 'auth-overlay'
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:sans-serif;z-index:9999'
  overlay.innerHTML = `
    <h2 style="color:#fff">🇵🇱 Polski B2/C1</h2>
    <input id="email" type="email" placeholder="Email" style="padding:10px;width:280px;border-radius:8px;border:1px solid #ccc"/>
    <input id="pass" type="password" placeholder="Пароль" style="padding:10px;width:280px;border-radius:8px;border:1px solid #ccc"/>
    <button onclick="signUp()" style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;width:280px">Зарегистрироваться</button>
    <button onclick="signIn()" style="padding:10px 24px;background:#fff;border:1px solid #6366f1;border-radius:8px;cursor:pointer;width:280px">Войти</button>`
  document.body.appendChild(overlay)
}

async function signUp() {
  const email = document.getElementById('email').value
  const pass = document.getElementById('pass').value
  const { error } = await supabase.auth.signUp({ email, password: pass })
  if (error) alert(error.message)
  else alert('Проверьте почту для подтверждения!')
}

async function signIn() {
  const email = document.getElementById('email').value
  const pass = document.getElementById('pass').value
  const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
  if (error) alert(error.message)
  else {
    document.getElementById('auth-overlay').remove()
    checkAccess()
  }
}

function startTrial(trialEndsAt) {
  if (!trialEndsAt) return
  const interval = setInterval(() => {
    const left = new Date(trialEndsAt) - new Date()
    if (left <= 0) { clearInterval(interval); showPaywall() }
  }, 10000)
}

function showPaywall() {
  if (document.getElementById('paywall-overlay')) return
  const overlay = document.createElement('div')
  overlay.id = 'paywall-overlay'
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:sans-serif;z-index:9999'
  overlay.innerHTML = `
    <h2 style="color:#fff">Пробный период закончился</h2>
    <p style="color:#ccc">Оформите подписку для продолжения</p>
    <button style="padding:12px 32px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer">Оплатить доступ</button>`
  document.body.appendChild(overlay)
}

function fullAccess() {
  console.log('Полный доступ')
}

setTimeout(() => checkAccess(), 500)
