const API_BASE = "http://localhost:8080";

const CONFIG = {
  clientes: {
    nomeExibicao: "Cliente",
    rota: "clientes",
    buscaNomeHabilitada: true,
    campos: [
      { id: "nome", label: "Nome", tipo: "text" },
      { id: "cpf", label: "CPF", tipo: "text" },
      { id: "telefone", label: "Telefone", tipo: "text" },
      { id: "email", label: "Email", tipo: "email" },
      { id: "cidade", label: "Cidade", tipo: "text" }
    ]
  },
  produtos: {
    nomeExibicao: "Produto",
    rota: "produtos",
    buscaNomeHabilitada: true,
    campos: [
      { id: "nome", label: "Nome", tipo: "text" },
      { id: "marca", label: "Marca", tipo: "text" },
      { id: "categoria", label: "Categoria", tipo: "text" },
      { id: "preco", label: "Preço", tipo: "number", step: "0.01" },
      { id: "estoque", label: "Estoque", tipo: "number", step: "1" }
    ]
  },
  vendas: {
    nomeExibicao: "Venda",
    rota: "vendas",
    buscaNomeHabilitada: false,
    campos: [
      { id: "dataVenda", label: "Data da Venda", tipo: "date" },
      { id: "quantidade", label: "Quantidade", tipo: "number", step: "1" },
      { id: "clienteId", label: "ID do Cliente", tipo: "number", step: "1" },
      { id: "produtoId", label: "ID do Produto", tipo: "number", step: "1" },
      { id: "valorTotal", label: "Valor Total", tipo: "number", step: "0.01", readonly: true }
    ]
  }
};

let entidadeAtual = "clientes";

function getEntidadeSelecionada() {
  return entidadeAtual;
}

function getConfigAtual() {
  return CONFIG[getEntidadeSelecionada()];
}

function mostrarMensagem(texto, tipo = "neutra") {
  const mensagem = document.getElementById("mensagem");
  if (!mensagem) return;
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

function mostrarResultado(dados) {
  const resultado = document.getElementById("resultado");
  if (!resultado) return;
  resultado.textContent = JSON.stringify(dados, null, 2);
}

function mostrarErro(texto) {
  console.error(texto);
  mostrarMensagem(texto, "erro");
  const resultado = document.getElementById("resultado");
  if (resultado) {
    resultado.textContent = `Erro: ${texto}`;
  }
}

function limparResultado() {
  const resultado = document.getElementById("resultado");
  if (resultado) {
    resultado.textContent = "Nenhum dado carregado.";
  }
}

function limparTabela() {
  const wrapper = document.getElementById("tabelaWrapper");
  if (wrapper) {
    wrapper.innerHTML = '<p class="sem-dados">Nenhum dado carregado.</p>';
  }
}

function atualizarEstadoBotoesEntidade() {
  document.querySelectorAll(".option-btn").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.entidade === entidadeAtual);
  });
}

function atualizarAvisoBuscaNome() {
  const config = getConfigAtual();
  const aviso = document.getElementById("avisoBuscaNome");
  const campoNome = document.getElementById("buscarNome");
  const botaoNome = document.getElementById("btnBuscarNome");

  if (!aviso || !campoNome || !botaoNome) return;

  if (config.buscaNomeHabilitada) {
    aviso.textContent = "";
    campoNome.disabled = false;
    botaoNome.disabled = false;
    botaoNome.style.opacity = "1";
    campoNome.placeholder = "Digite o nome";
  } else {
    aviso.textContent = "Busca por nome não se aplica para vendas. Use a busca por ID ou liste todos.";
    campoNome.disabled = true;
    botaoNome.disabled = true;
    botaoNome.style.opacity = "0.6";
    campoNome.placeholder = "Busca indisponível para vendas";
    campoNome.value = "";
  }
}

function criarCampo(campo) {
  const wrapper = document.createElement("div");
  wrapper.className = campo.readonly ? "campo readonly" : "campo";

  const label = document.createElement("label");
  label.setAttribute("for", campo.id);
  label.textContent = campo.label;

  const input = document.createElement("input");
  input.type = campo.tipo;
  input.id = campo.id;
  input.name = campo.id;
  input.placeholder = `Digite ${campo.label.toLowerCase()}`;

  if (campo.step) input.step = campo.step;

  if (campo.readonly) {
    input.readOnly = true;
    input.placeholder = "Calculado automaticamente";
  }

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderizarFormulario() {
  const formulario = document.getElementById("formularioDinamico");
  const config = getConfigAtual();

  if (!formulario) return;

  formulario.innerHTML = "";

  config.campos.forEach((campo) => {
    formulario.appendChild(criarCampo(campo));
  });

  limparCamposFormulario();
  limparTabela();
  limparResultado();
  atualizarAvisoBuscaNome();
  mostrarMensagem(`Formulário de ${config.nomeExibicao.toLowerCase()} carregado com sucesso.`, "neutra");
}

function limparCamposFormulario() {
  const idRegistro = document.getElementById("idRegistro");
  const buscarId = document.getElementById("buscarId");
  const buscarNome = document.getElementById("buscarNome");

  if (idRegistro) idRegistro.value = "";
  if (buscarId) buscarId.value = "";
  if (buscarNome) buscarNome.value = "";

  const config = getConfigAtual();

  config.campos.forEach((campo) => {
    const elemento = document.getElementById(campo.id);
    if (elemento) elemento.value = "";
  });
}

function coletarDadosFormulario() {
  const config = getConfigAtual();
  const dados = {};

  config.campos.forEach((campo) => {
    const input = document.getElementById(campo.id);
    let valor = input ? input.value : "";

    if (campo.tipo === "number" && valor !== "") {
      valor = Number(valor);
    }

    dados[campo.id] = valor;
  });

  return dados;
}

function normalizarPayload(entidade, dados) {
  if (entidade === "clientes") {
    return {
      nome: dados.nome,
      cpf: dados.cpf,
      telefone: dados.telefone,
      email: dados.email,
      cidade: dados.cidade
    };
  }

  if (entidade === "produtos") {
    return {
      nome: dados.nome,
      marca: dados.marca,
      categoria: dados.categoria,
      preco: dados.preco,
      estoque: dados.estoque
    };
  }

  if (entidade === "vendas") {
    return {
      dataVenda: dados.dataVenda,
      quantidade: dados.quantidade,
      cliente: dados.clienteId ? { id: Number(dados.clienteId) } : null,
      produto: dados.produtoId ? { id: Number(dados.produtoId) } : null
    };
  }

  return dados;
}

function preencherFormularioComRegistro(entidade, registro) {
  if (!registro) return;

  if (entidade === "clientes") {
    document.getElementById("nome").value = registro.nome ?? "";
    document.getElementById("cpf").value = registro.cpf ?? "";
    document.getElementById("telefone").value = registro.telefone ?? "";
    document.getElementById("email").value = registro.email ?? "";
    document.getElementById("cidade").value = registro.cidade ?? "";
    return;
  }

  if (entidade === "produtos") {
    document.getElementById("nome").value = registro.nome ?? "";
    document.getElementById("marca").value = registro.marca ?? "";
    document.getElementById("categoria").value = registro.categoria ?? "";
    document.getElementById("preco").value = registro.preco ?? "";
    document.getElementById("estoque").value = registro.estoque ?? "";
    return;
  }

  if (entidade === "vendas") {
    document.getElementById("dataVenda").value = registro.dataVenda ?? "";
    document.getElementById("quantidade").value = registro.quantidade ?? "";
    document.getElementById("clienteId").value = registro.cliente?.id ?? "";
    document.getElementById("produtoId").value = registro.produto?.id ?? "";
    document.getElementById("valorTotal").value = registro.valorTotal ?? "";
  }
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarEstoqueBadge(estoque) {
  if (estoque === null || estoque === undefined || estoque === "") return "-";

  const valor = Number(estoque);

  if (valor <= 0) {
    return '<span class="badge badge-zero">Sem estoque</span>';
  }

  if (valor <= 5) {
    return `<span class="badge badge-baixo">Baixo: ${valor}</span>`;
  }

  return `<span class="badge badge-estoque">Estoque: ${valor}</span>`;
}

function renderAcoesLinha(id) {
  return `
    <button class="btn-linha-editar" type="button" data-acao="editar" data-id="${id}">
      <i class="fa-solid fa-pen"></i>Editar
    </button>
    <button class="btn-linha-excluir" type="button" data-acao="excluir" data-id="${id}">
      <i class="fa-solid fa-trash"></i>Apagar
    </button>
  `;
}

function renderTabela(dados) {
  const lista = Array.isArray(dados) ? dados : [dados];
  const wrapper = document.getElementById("tabelaWrapper");
  const entidade = getEntidadeSelecionada();

  if (!wrapper) return;

  if (!lista || lista.length === 0) {
    alert("Nenhum registro encontrado.")
    //wrapper.innerHTML = '<p class="sem-dados">Nenhum registro encontrado.</p>';
    return;
  }

  let html = "<table><thead><tr>";

  if (entidade === "clientes") {
    html += `
      <th>ID</th>
      <th>Nome</th>
      <th>CPF</th>
      <th>Telefone</th>
      <th>Email</th>
      <th>Cidade</th>
      <th>Ações</th>
    `;
  }

  if (entidade === "produtos") {
    html += `
      <th>ID</th>
      <th>Nome</th>
      <th>Preço</th>
      <th>Marca</th>
      <th>Categoria</th>
      <th>Estoque</th>
      <th>Ações</th>
    `;
  }

  if (entidade === "vendas") {
    html += `
      <th>ID</th>
      <th>Cliente</th>
      <th>Produto</th>
      <th>Quantidade</th>
      <th>Valor Total</th>
      <th>Data</th>
      <th>Ações</th>
    `;
  }

  html += "</tr></thead><tbody>";

  lista.forEach((item) => {
    html += "<tr>";

    if (entidade === "clientes") {
      html += `
        <td>${item.id ?? ""}</td>
        <td>${item.nome ?? ""}</td>
        <td>${item.cpf ?? ""}</td>
        <td>${item.telefone ?? ""}</td>
        <td>${item.email ?? ""}</td>
        <td>${item.cidade ?? ""}</td>
        <td>${renderAcoesLinha(item.id)}</td>
      `;
    }

    if (entidade === "produtos") {
      html += `
        <td>${item.id ?? ""}</td>
        <td>${item.nome ?? ""}</td> 
        <td>${formatarMoeda(item.preco)}</td>
        <td>${item.marca ?? ""}</td>
        <td>${item.categoria ?? ""}</td>
        <td>${formatarEstoqueBadge(item.estoque)}</td>
        <td>${renderAcoesLinha(item.id)}</td>
      `;
    }

    if (entidade === "vendas") {
      html += `
        <td>${item.id ?? ""}</td>
        <td>${item.cliente?.nome ?? item.cliente?.id ?? "-"}</td>
        <td>${item.produto?.nome ?? item.produto?.id ?? "-"}</td>
        <td>${item.quantidade ?? ""}</td>
        <td>${formatarMoeda(item.valorTotal)}</td>
        <td>${item.dataVenda ?? ""}</td>
        <td>${renderAcoesLinha(item.id)}</td>
      `;
    }

    html += "</tr>";
  });

  html += "</tbody></table>";
  wrapper.innerHTML = html;
}

async function tratarResposta(resposta, mensagemErroPadrao) {
  if (!resposta.ok) {
    let textoErro = mensagemErroPadrao;

    try {
      const contentType = resposta.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const json = await resposta.json();
        textoErro = json.message || json.erro || JSON.stringify(json);
      } else {
        textoErro = await resposta.text();
      }
    } catch (e) {}

    throw new Error(textoErro);
  }

  if (resposta.status === 204) return null;

  const contentType = resposta.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await resposta.json();
  }

  return await resposta.text();
}

async function listar() {
  const config = getConfigAtual();

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}`);
    const dados = await tratarResposta(
      resposta,
      `Não foi possível listar ${config.nomeExibicao.toLowerCase()}s.`
    );

    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao}(s) listado(s) com sucesso.`, "sucesso");
  } catch (erro) {
    mostrarErro(erro.message);
    limparTabela();
  }
}

async function buscarId() {
  const config = getConfigAtual();
  const id = document.getElementById("buscarId")?.value;

  if (!id) {
    mostrarErro("Digite um ID para buscar.");
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}/${id}`);
    const dados = await tratarResposta(
      resposta,
      `${config.nomeExibicao} não encontrado.`
    );

    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} encontrado com sucesso.`, "sucesso");
  } catch (erro) {
    mostrarErro(erro.message);
    limparTabela();
  }
}

async function buscarNome() {
  const config = getConfigAtual();
  const nome = document.getElementById("buscarNome")?.value.trim();

  if (!config.buscaNomeHabilitada) {
    mostrarErro("Busca por nome não está disponível para vendas.");
    return;
  }

  if (!nome) {
    mostrarErro("Digite um nome para buscar.");
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}/buscar/${encodeURIComponent(nome)}`);
    const dados = await tratarResposta(
      resposta,
      `${config.nomeExibicao} não encontrado.`
    );

    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} encontrado com sucesso.`, "sucesso");
  } catch (erro) {
    mostrarErro(erro.message);
    limparTabela();
  }
}

async function carregarRegistroPorIdNoFormulario() {
  const config = getConfigAtual();
  const entidade = getEntidadeSelecionada();
  const id = document.getElementById("idRegistro")?.value;

  if (!id) return;

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}/${id}`);
    const dados = await tratarResposta(
      resposta,
      `${config.nomeExibicao} não encontrado.`
    );

    preencherFormularioComRegistro(entidade, dados);
    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} carregado no formulário com sucesso.`, "sucesso");
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

async function adicionar() {
  const config = getConfigAtual();
  const entidade = getEntidadeSelecionada();
  const idRegistro = document.getElementById("idRegistro")?.value.trim();

  if (idRegistro !== "") {
    alert("Para adicionar um novo registro, deixe o ID em branco.");
    return;
  }

  const dados = coletarDadosFormulario();
  const payload = normalizarPayload(entidade, dados);

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await tratarResposta(
      resposta,
      `Erro ao cadastrar ${config.nomeExibicao.toLowerCase()}.`
    );

    renderTabela(resultado);
    mostrarResultado(resultado);
    mostrarMensagem(`${config.nomeExibicao} cadastrado com sucesso.`, "sucesso");
    limparCamposFormulario();
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

async function atualizar() {
  const config = getConfigAtual();
  const entidade = getEntidadeSelecionada();
  const id = document.getElementById("idRegistro")?.value;

  if (!id) {
    mostrarErro("Digite o ID do registro para atualizar.");
    return;
  }

  const dados = coletarDadosFormulario();
  const payload = normalizarPayload(entidade, dados);

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await tratarResposta(
      resposta,
      `Erro ao alterar ${config.nomeExibicao.toLowerCase()}.`
    );

    renderTabela(resultado);
    mostrarResultado(resultado);
    mostrarMensagem(`${config.nomeExibicao} alterado com sucesso.`, "sucesso");
    limparCamposFormulario();
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

async function deletarRegistro() {
  const config = getConfigAtual();
  const id = document.getElementById("idRegistro")?.value;

  if (!id) {
    mostrarErro("Digite o ID do registro para deletar.");
    return;
  }

  const confirmar = confirm(`Tem certeza que deseja apagar este ${config.nomeExibicao.toLowerCase()}?`);

  if (!confirmar) {
    mostrarMensagem("Exclusão cancelada.", "neutra");
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/${config.rota}/${id}`, {
      method: "DELETE"
    });

    await tratarResposta(
      resposta,
      `Erro ao apagar ${config.nomeExibicao.toLowerCase()}.`
    );

    limparCamposFormulario();
    limparTabela();
    mostrarResultado({ mensagem: `${config.nomeExibicao} apagado com sucesso.` });
    mostrarMensagem(`${config.nomeExibicao} apagado com sucesso.`, "sucesso");
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

async function editarRegistroDaTabela(id) {
  const campoId = document.getElementById("idRegistro");
  if (!campoId) return;

  campoId.value = id;
  await carregarRegistroPorIdNoFormulario();

  window.scrollTo({
    top: campoId.getBoundingClientRect().top + window.scrollY - 120,
    behavior: "smooth"
  });
}

async function excluirRegistroDaTabela(id) {
  const campoId = document.getElementById("idRegistro");
  if (!campoId) return;

  campoId.value = id;
  await deletarRegistro();
}

function selecionarEntidade(entidade) {
  entidadeAtual = entidade;
  atualizarEstadoBotoesEntidade();
  renderizarFormulario();
}

function configurarEventos() {
  document.querySelectorAll(".option-btn").forEach((botao) => {
    botao.addEventListener("click", () => {
      selecionarEntidade(botao.dataset.entidade);
    });
  });

  document.getElementById("btnListar")?.addEventListener("click", listar);
  document.getElementById("btnBuscarId")?.addEventListener("click", buscarId);
  document.getElementById("btnBuscarNome")?.addEventListener("click", buscarNome);
  document.getElementById("btnAdicionar")?.addEventListener("click", adicionar);
  document.getElementById("btnAtualizar")?.addEventListener("click", atualizar);
  document.getElementById("btnDeletar")?.addEventListener("click", deletarRegistro);
  document.getElementById("idRegistro")?.addEventListener("blur", carregarRegistroPorIdNoFormulario);

  document.getElementById("tabelaWrapper")?.addEventListener("click", async (event) => {
    const botao = event.target.closest("button[data-acao]");
    if (!botao) return;

    const acao = botao.dataset.acao;
    const id = Number(botao.dataset.id);

    if (!id) return;

    if (acao === "editar") {
      await editarRegistroDaTabela(id);
    }

    if (acao === "excluir") {
      await excluirRegistroDaTabela(id);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  configurarEventos();
  atualizarEstadoBotoesEntidade();
  renderizarFormulario();
});