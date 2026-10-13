import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { loginAdmin, login } from './helpers/auth.helper.js';

// Carrega os dados do JSON (Data-Driven Testing)
const testData = JSON.parse(readFileSync(new URL('./data/alunos.json', import.meta.url)));

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Suíte de Testes da API - Gestão de Alunos', function () {
  let adminToken;
  let alunoCriado;
  let alunoToken;

  // Gera dados únicos a cada execução para evitar o erro 409 (duplicidade)
  const timestamp = Date.now();
  const alunoDinamico = {
    ...testData.novoAluno,
    email: `aluno_${timestamp}@email.com`,
    matricula: `MAT_${timestamp.toString().slice(-6)}`,
    disciplinas: ['disciplina-matematica'] // Garante a vinculação da disciplina no cadastro
  };

  before(async function () {
    const adminAuth = await loginAdmin();
    adminToken = adminAuth.token;
    expect(adminToken).to.be.a('string');
  });

  it('1. Deve cadastrar um novo aluno como Administrador', async function () {
    const response = await request(BASE_URL)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(alunoDinamico);

    expect(response.status).to.be.oneOf([200, 201]);
    
    alunoCriado = response.body.aluno || response.body.data || response.body;
    expect(alunoCriado).to.have.property('id');
  });

  it('2. Deve realizar o login com o aluno recém-criado', async function () {
    const alunoAuth = await login(alunoDinamico.email, alunoDinamico.senha);
    alunoToken = alunoAuth.token;
    
    expect(alunoToken).to.be.a('string');
  });

  it('3. Deve registrar a entrega de um trabalho como Aluno', async function () {
    // Se o aluno recém-criado não possuir vínculo automático com a disciplina, 
    // usamos o ID retornado do cadastro ou realizamos o teste de entrega.
    const alunoId = alunoCriado.id || alunoCriado._id || 'aluno-ana-souza';

    const response = await request(BASE_URL)
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send(testData.trabalho);

    if (response.status !== 201 && response.status !== 200) {
      console.log('Resposta ao entregar trabalho:', response.body);
    }

    expect(response.status).to.be.oneOf([200, 201]);
  });
});