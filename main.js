// ==============================================================
// 1. CONFIGURAÇÃO
// ==============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxTytL1eFy2lTivV9y2vPCdUpAIKhNtD0nluTRhalRygv4hnu-Bs6ttr1LUN6mpVVw1/exec"; 

let TODAS_FOTOS = [];

// ==============================================================
// 2. FUNÇÃO: CARREGAR LISTA DO BLOG (blog.html)
// ==============================================================
async function carregarBlog() {
    const container = document.getElementById('lista-posts');
    if (!container) return; 

    try {
        console.log("Iniciando busca do Blog...");
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#666;">⏳ Carregando novidades...</div>';
        
        // Timestamp para evitar cache
        const response = await fetch(API_URL + "?v=api&tipo=blog&t=" + new Date().getTime());
        if (!response.ok) throw new Error("Erro na conexão: " + response.status);

        const posts = await response.json();
        container.innerHTML = ''; 

        if (!posts || posts.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px;">Nenhum post encontrado.</div>';
            return;
        }

        posts.forEach(post => {
            let imgUrl = post.capaUrl;
            if (!imgUrl || imgUrl === "") imgUrl = "https://via.placeholder.com/300x200?text=Sem+Imagem";

            const html = `
                <article class="blog-card">
                    <img src="${imgUrl}" alt="${post.titulo}" onerror="this.src='https://via.placeholder.com/300x200?text=Erro+Img'">
                    <div class="blog-info">
                        <h3 class="blog-title">${post.titulo}</h3>
                        <div class="blog-meta">
                            📅 ${post.data} <span style="margin:0 5px; color:#ccc;">|</span> 📂 ${post.categoria}
                        </div>
                        <p class="blog-desc">
                            ${post.conteudo ? post.conteudo.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : ''} 
                        </p>
                        <a href="post.html?id=${post.id}" class="btn-cta" style="margin-top:15px; width:fit-content; font-size:0.8rem;">Ler Mais</a>
                    </div>
                </article>
            `;
            container.innerHTML += html;
        });

    } catch (error) {
        console.error("Erro no Blog:", error);
        container.innerHTML = `<p style="text-align:center; color:red">Erro ao carregar posts.</p>`;
    }
}

// ==============================================================
// 3. FUNÇÃO: CARREGAR POST ÚNICO (post.html)
// ==============================================================
async function carregarPostUnico() {
    const container = document.getElementById('post-content-area');
    const recentContainer = document.getElementById('recent-posts-list');
    
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        container.innerHTML = '<p>Post não especificado.</p>';
        return;
    }

    try {
        container.innerHTML = '<p style="text-align:center">Carregando conteúdo...</p>';
    
        const response = await fetch(API_URL + "?v=api&tipo=blog&t=" + new Date().getTime());
        const posts = await response.json();
        const postAtual = posts.find(p => p.id == postId);

        if (!postAtual) {
            container.innerHTML = '<h2>Post não encontrado (Erro 404)</h2><a href="blog.html" class="btn-cta">Voltar</a>';
            return;
        }

        document.title = postAtual.titulo + " - Senaquinho";
        const breadcrumb = document.getElementById('post-breadcrumb');
        if(breadcrumb) breadcrumb.innerText = postAtual.titulo;
        let imgUrl = postAtual.capaUrl || "https://via.placeholder.com/800x400";

        container.innerHTML = `
            <div class="single-post-header">
                <h1 class="single-post-title">${postAtual.titulo}</h1>
                <div class="single-post-meta">
                    <span class="meta-item">📅 ${postAtual.data}</span>
                    <span class="meta-item">📂 ${postAtual.categoria}</span>
                    <span class="meta-item">👤 ${postAtual.autor}</span>
                </div>
            </div>

            <img src="${imgUrl}" class="single-post-img" onerror="this.src='https://via.placeholder.com/800x400?text=Erro+Imagem'">

            <div class="single-post-body">
                ${postAtual.conteudo} 
            </div>
            
            <hr style="margin: 40px 0; border:0; border-top:1px solid #eee;">
            <a href="blog.html" class="btn-cta" style="background:#666;">&larr; Voltar para o Blog</a>
        `;
        if (recentContainer) {
            const recentes = posts.filter(p => p.id != postId).slice(0, 4);
            recentContainer.innerHTML = '';
            
            recentes.forEach(rec => {
                let recImg = rec.capaUrl || "https://via.placeholder.com/100";
                recentContainer.innerHTML += `
                    <a href="post.html?id=${rec.id}" class="recent-post-card">
                        <img src="${recImg}" class="recent-post-img">
                        <div class="recent-post-info">
                            <h4>${rec.titulo}</h4>
                            <span class="recent-post-date">📅 ${rec.data}</span>
                        </div>
                    </a>
                `;
            });
        }

    } catch (error) {
        console.error("Erro Post Único:", error);
        container.innerHTML = '<p>Erro ao carregar o post.</p>';
    }
}

// ==============================================================
// 4. FUNÇÃO: CARREGAR GALERIA (galeria.html)
// ==============================================================
async function carregarGaleria(filtro = 'todos') {
    const container = document.getElementById('grid-galeria');
    if (!container) return;
    if (TODAS_FOTOS.length === 0) {
        try {
            if(container.innerHTML.trim() === "") container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Carregando fotos...</p>';
            
            const response = await fetch(API_URL + "?v=api&tipo=galeria&t=" + new Date().getTime());
            if (!response.ok) throw new Error("Erro API Galeria");
            
            TODAS_FOTOS = await response.json();
        } catch (error) {
            console.error("Erro Galeria:", error);
            container.innerHTML = '<p>Erro ao carregar galeria.</p>';
            return;
        }
    }

    container.innerHTML = '';
    
    TODAS_FOTOS.forEach(foto => {
        const deveMostrar = filtro === 'todos' || foto.categoria.toLowerCase() === filtro.toLowerCase();

        if (deveMostrar) {
            let imgUrl = foto.url || "https://via.placeholder.com/300";

            const html = `
                <div class="gallery-item" style="border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                    ${foto.fixado ? '<span style="position:absolute; top:10px; right:10px; background:#ff8c00; color:white; padding:3px 8px; font-size:0.7rem; border-radius:4px; font-weight:bold; z-index:2;">★ DESTAQUE</span>' : ''}
                    <img src="${imgUrl}" style="width:100%; height:200px; object-fit:cover; display:block;" onerror="this.src='https://via.placeholder.com/300?text=Erro'">
                    <div style="padding:15px;">
                        <small style="color:#003366; font-weight:bold; text-transform:uppercase; font-size:0.75rem;">${foto.categoria}</small>
                        <p style="margin:5px 0 0 0; font-size:0.9rem; color:#555;">${foto.descricao}</p>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        }
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnFiltro = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        btn.style.backgroundColor = (btnFiltro === filtro) ? '#ff8c00' : '#003366';
    });
}

// ==============================================================
// 5. INICIALIZAÇÃO AUTOMÁTICA
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarBlog();
    carregarPostUnico();
    carregarGaleria();
});