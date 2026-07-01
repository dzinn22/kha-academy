// Configuração da API
const API_BASE_URL = 'https://soluctions.onrender.com';

// Função para fazer login com Discord via API
async function loginWithDiscord() {
    try {
        // Redireciona para o endpoint de autenticação do Discord na API
        const response = await fetch(`${API_BASE_URL}/api/auth/discord`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        console.error('Erro ao iniciar login com Discord:', error);
        alert('Erro ao conectar com Discord. Tente novamente.');
    }
}

// Função para fazer logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            localStorage.removeItem('discord_token');
            localStorage.removeItem('user_info');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
}

// Função para obter informações do usuário autenticado
async function getUserInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.user;
        } else if (response.status === 401) {
            // Usuário não autenticado
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        return null;
    }
}

// Função para renderizar o perfil do usuário
async function renderUserProfile() {
    const userProfile = document.getElementById('user-profile');
    if (!userProfile) return;

    const user = await getUserInfo();

    if (user) {
        const isDashboard = window.location.pathname.includes('/dashboard');
        let dashboardLink = '';
        if (!isDashboard) {
            dashboardLink = `
                <a href="/dashboard" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Ir para Dashboard</span>
                </a>
            `;
        }

        userProfile.innerHTML = `
            <div class="user-profile-wrapper">
                <div class="user-info" id="profile-toggle">
                    <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}" alt="${user.username}" onerror="this.src='https://via.placeholder.com/32'">
                    <span>${user.username}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </div>
                <div class="user-dropdown">
                    ${dashboardLink}
                    <a href="#" onclick="logout(); return false;" class="dropdown-item logout-link">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </a>
                </div>
            </div>
        `;
        userProfile.style.display = 'flex';

        const loginBtn = document.querySelector('.menu a.login-btn');
        if (loginBtn) loginBtn.style.display = 'none';

        const profileToggle = document.getElementById('profile-toggle');
        const dropdown = userProfile.querySelector('.user-dropdown');

        profileToggle.addEventListener('click', () => {
            dropdown.classList.toggle('active');
            profileToggle.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userProfile.contains(e.target)) {
                dropdown.classList.remove('active');
                profileToggle.classList.remove('active');
            }
        });

        localStorage.setItem('user_info', JSON.stringify(user));
    } else {
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.style.display = 'none';
            userProfile.innerHTML = '';
        }

        const loginBtn = document.querySelector('.menu a.login-btn');
        if (loginBtn) loginBtn.style.display = 'flex';
    }
}

// Executar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('discord-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginWithDiscord();
        });
    }

    // Verificar se há callback do Discord
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Enviar código para o backend processar
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/callback?code=${code}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    localStorage.setItem('user_info', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                }
            }
        } catch (error) {
            console.error('Erro ao processar callback:', error);
        }
    }

    // Renderizar perfil do usuário
    await renderUserProfile();
});
