const CLIENT_ID = '1383611337678258286';

// Alternar facilmente entre local e produção
const REDIRECT_URI = window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://astexsoluctions.squareweb.app";

function loginWithDiscord() {
    const token = localStorage.getItem('discord_token');
    if (token) {
        window.location.href = '/';
        return;
    }

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'token',
        scope: 'identify email guilds.join'
    });

    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
}

function getUserInfo(accessToken) {
    fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(res => res.json())
        .then(data => {
            const userProfile = document.getElementById('user-profile');
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
                        <img src="https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}" alt="${data.username}">
                        <span>${data.username}</span>
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </div>
                    <div class="user-dropdown">
                        ${dashboardLink}
                        <a href="#" onclick="logout()" class="dropdown-item logout-link">
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

            joinServer(data.id, accessToken);
            saveUserInfo(data);
        });
}

function saveUserInfo(user) {
    fetch('/save-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: user.username,
            iduser: user.id,
            emailuser: user.email || 'N/A',
            avataruser: user.avatar,
            faixauser: 'Padrão'
        })
    }).then(res => res.json())
      .then(data => console.log(data.message));
}

function logout() {
    localStorage.removeItem('discord_token');

    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.style.display = 'none';
        userProfile.innerHTML = '';
    }

    const loginBtn = document.querySelector('.menu a.login-btn');
    if (loginBtn) loginBtn.style.display = 'flex';

    window.location.href = '/';
}

function joinServer(userId, accessToken) {
    fetch('/api/join-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessToken })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("Usuário adicionado com sucesso.");
            } else {
                console.error("Erro ao adicionar o usuário:", data.error);
            }
        })
        .catch(err => console.error("Erro de rede:", err));
}

// Executa assim que DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById('discord-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', loginWithDiscord);

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('access_token');

    if (token) {
        localStorage.setItem('discord_token', token);
        getUserInfo(token);
        // NOVO: Envie o token para o backend para criar a sessão
        fetch('/auth/discord/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Agora o backend sabe quem é o usuário!
                window.location.href = '/dashboard';
            } else {
                alert('Erro ao autenticar no backend.');
            }
        });
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (localStorage.getItem('discord_token')) {
        const savedToken = localStorage.getItem('discord_token');
        fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${savedToken}` }
        })
            .then(res => {
                if (!res.ok) {
                    localStorage.removeItem('discord_token');
                    alert('Sua sessão expirou ou o login falhou. Por favor, faça login novamente.');
                    const loginBtn = document.querySelector('.menu a.login-btn');
                    if (loginBtn) loginBtn.style.display = 'flex';
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data) getUserInfo(savedToken);
            })
            .catch(() => {
                localStorage.removeItem('discord_token');
                alert('Erro ao validar o login. Por favor, faça login novamente.');
                const loginBtn = document.querySelector('.menu a.login-btn');
                if (loginBtn) loginBtn.style.display = 'flex';
            });
    }

    // Scroll suave para links com #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
