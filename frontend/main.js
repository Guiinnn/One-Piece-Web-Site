/**
 * PROJETO ONE PIECE WIKI - main.js
 * Foco: Manipulação de DOM, Fetch API e UX Moderno
 * Business Unit: ByteClass (learnTECH)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar funções
  carregarPersonagens();
  gerenciarHeader();
  configurarFormulario();
  configurarConversar();
  inicializarCarrosseis();
});

/* ============================================================
   1. CARREGAMENTO DE PERSONAGENS (FETCH LOCAL/API)
   ============================================================ */
async function carregarPersonagens() {
  const container = document.getElementById("container-personagens");

  if (!container) return;

  try {
    // Simulando delay de rede para mostrar efeito de loading (opcional)
    // await new Promise(res => setTimeout(res, 800));

    const response = await fetch("./personagens.json");

    if (!response.ok) throw new Error("Erro ao carregar dados locais");

    const personagens = await response.json();
    renderizarCards(personagens);
  } catch (error) {
    console.error("Erro:", error);
    container.innerHTML = `
            <p class="erro">Não foi possível carregar os piratas. 
            Verifique o arquivo personagens.json.</p>
        `;
  }
}

function renderizarCards(lista) {
  const container = document.getElementById("container-personagens");

  if (!container) return; // Segurança caso o container não exista no HTML atual

  // Limpa o parágrafo de "Carregando..."
  container.innerHTML = "";

  lista.forEach((p, index) => {
    const card = document.createElement("article");
    card.classList.add("card-pirata");

    // Adicionando delay dinâmico para animação Stagger no CSS
    card.style.animationDelay = `${(index + 1) * 0.1}s`;

    card.innerHTML = `
            <div class="card-imagem">
                <img src="src/imagens/${p.imagem}" alt="${p.nome}" onerror="this.src='https://via.placeholder.com/350x450?text=Pirata'">
            </div>
            <div class="card-info">
                <h3>${p.nome}</h3>
                <span class="alcunha">${p.alcunha}</span>
                <p>${p.descricao}</p>
                <div class="recompensa">${p.recompensa}</div>
            </div>
        `;

    container.appendChild(card);
  });
}

/* ============================================================
   2. UX: GERENCIAMENTO DO HEADER (SCROLL)
   ============================================================ */
function gerenciarHeader() {
  const header = document.querySelector(".main-header");
  const navbar = document.querySelector(".navbar");

  const atualizarHeader = () => {
    if (window.scrollY > 50) {
      header.style.padding = "0.5rem 5%";
    } else {
      header.style.padding = "1rem 5%";
    }

    if (window.scrollY > 800) {
      if (navbar) {
        navbar.classList.add("com-cor");
      }
      header.style.background = "rgba(10, 10, 10, 0.95)";
    } else {
      if (navbar) {
        navbar.classList.remove("com-cor");
      }
      header.style.background = "transparent";
    }
  };

  window.addEventListener("scroll", atualizarHeader);
  atualizarHeader();
}

/* ============================================================
   3. FORMULÁRIO: ENVIO E VALIDAÇÃO
   ============================================================ */
function configurarFormulario() {
  const form = document.getElementById("contact-form");

  if (!form) return; // Evita que o JavaScript quebre se o formulário não existir na página

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Captura de dados
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    // Simulação de envio para o dono do site
    console.log(
      "%c Envio de Mensagem One Piece ",
      "background: #ff4500; color: white; padding: 5px;",
    );
    console.table(dados);

    // Feedback visual para o aluno/usuário
    const botao = form.querySelector("button");
    const textoOriginal = botao.innerHTML;

    botao.innerHTML = "Enviado com Sucesso! ⚓";
    botao.style.background = "#28a745";
    form.reset();

    setTimeout(() => {
      botao.innerHTML = textoOriginal;
      botao.style.background = "";
    }, 3000);
  });
}

/* ============================================================
   4. CONVERSAR: CHAT COM PERSONAGENS (via JSON)
   ============================================================ */
let dadosChat = null;

async function carregarRespostas() {
  const resp = await fetch("./conversa.json");
  dadosChat = await resp.json(); //Ler o JSON e armazenar na variavel
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") //Remover os acentos pra ficar tudo igual
    .replace(/[?!.,]/g, ""); //Remover pontuação
}

function detectarCategoria(texto) {
  if (!dadosChat?.categorias) return "padrao"; //Definir qual a categoria
  const textoNormalizado = normalizarTexto(texto);
  for (const [categoria, palavras] of Object.entries(dadosChat.categorias)) { //For pra percorrer as categorias e palavras do JSON
    if (palavras.some((palavra) => textoNormalizado.includes(normalizarTexto(palavra)))) {
      return categoria; //Se a palavrar tiver na categoria, retorna a categoria
    }
  }

  return "padrao";
}

function gerarResposta(personagem, texto) {
  const categoria = detectarCategoria(texto); //Descobrir a categoria da mensagem do usuario
//Pegar a resposta do personagem no JSON
  const respostasPersonagem = dadosChat?.personagens?.[personagem.toLowerCase()]; //Pegar a resposta do personagem no JSON

  if (!respostasPersonagem) return "Estou ouvindo você com atenção."; //Se não tiver resposta, retorna mensagem padrão

  const lista = respostasPersonagem[categoria] || respostasPersonagem["saudacao"]; //Se não tiver a categoria, retorna uma saudação

  return lista[Math.floor(Math.random() * lista.length)]; //Retorna resposta aleatoria
}

async function configurarConversar() {
  const select = document.getElementById("personagem-select"); //Menu de escolher personagem
  const form = document.getElementById("conversation-form"); //Formulario de conversa
  const input = document.getElementById("conversation-input"); //Input de texto do usuario
  const box = document.getElementById("conversation-box"); //Caixa de conversa

  if (!select || !form || !input || !box) return;

  const adicionarMensagem = (autor, texto, tipo) => {
    const mensagem = document.createElement("div"); //Cria uma div pra mensagem
    mensagem.className = `message message-${tipo}`; //Estilizar mensagem dependendo do tipo
    mensagem.innerHTML = `<span class="message-author">${autor}</span><p>${texto}</p>`; //Definir o que tem na caixinha do HTML
    box.appendChild(mensagem); //Colocar mensagem na caixa de conversa
    box.scrollTop = box.scrollHeight; //Rolar a caixa automaticamente
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); //Evitar que a pagina recarregue

    const texto = input.value.trim();
    if (!texto) return; //Sem mensagem não faz nada

    adicionarMensagem("Você", texto, "user"); //Mostrar mensagem do usuario na caixinha
    input.value = "";
  
  try {
    const resposta = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensagem: texto, personagem: select.value })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao interagir com a API.");
    }

    adicionarMensagem(select.value, dados.resposta, "bot");
  } catch (error) {
    console.error(error);
    adicionarMensagem(
      "Sistema",
      "Não foi possível obter uma resposta.",
      "system"
    );
  }
});

  select.addEventListener("change", () => {
    adicionarMensagem("Sistema", `Agora você está conversando com ${select.value}.`, "system");
  });
}

/* ============================================================
   5. EFEITO DE REVELAÇÃO (INTERSECTION OBSERVER)
   ============================================================ */
// Faz a seção de história aparecer suavemente quando entra na tela
const observerOptions = { threshold: 0.2 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

const historySection = document.querySelector(".history-container");
if (historySection) {
  historySection.style.opacity = "0";
  historySection.style.transform = "translateY(50px)";
  historySection.style.transition = "all 1s ease-out";
  observer.observe(historySection);
}

/* ============================================================
   5. Carrosseis usando swiper
   ============================================================ */
function inicializarCarrosseis() {
  if (typeof Swiper === "undefined") {
    console.error("A biblioteca Swiper não foi carregada.");
    return;
  }

  // Remove slides de vídeo sem arquivo correspondente no projeto.
  const videoSlides = document.querySelectorAll(".swiper-inner video");
  if (videoSlides.length > 0) {
    console.warn(
      `${videoSlides.length} slides de vídeo foram removidos porque os arquivos não estão disponíveis.`,
    );
  }
  videoSlides.forEach((video) => {
    video.closest(".swiper-slide")?.remove();
  });

  // Inicializa o Swiper principal: controla o carrossel dos cards de personagens
  const swiperMain = new Swiper('.swiper-main', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true, // Rotação infinita
    coverflowEffect: {
      rotate: 0,
      stretch: -20,
      depth: 100,
      modifier: 3,
      slideShadows: true,
    },
    navigation: {
      nextEl: '.main-next',
      prevEl: '.main-prev',
    },
  });

  // Inicializa os Swipers internos: controlam as fotos e vídeos de cada personagem
  document.querySelectorAll('.swiper-inner').forEach((element) => {
    new Swiper(element, {
      direction: 'horizontal',
      nested: true,
      pagination: {
        el: element.querySelector('.swiper-pagination'),
        clickable: true,
      },
      navigation: {
        nextEl: element.querySelector('.inner-next'),
        prevEl: element.querySelector('.inner-prev'),
      },
      on: {
        slideChange: function () {
          this.slides.forEach((slide) => {
            const video = slide.querySelector('video');
            if (video) video.pause();
          });
        }
      }
    });
  });
}
