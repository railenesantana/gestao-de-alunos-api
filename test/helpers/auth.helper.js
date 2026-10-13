import request from 'supertest';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Realiza o login de um usuário e retorna o token e os dados.
 * @param {string} email 
 * @param {string} senha 
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, senha) {
  const response = await request(BASE_URL)
    .post('/api/auth/login')
    .send({ email, senha });

  if (response.status !== 200) {
    throw new Error(`Falha no login para ${email}: ${JSON.stringify(response.body)}`);
  }

  return {
    token: response.body.token,
    user: response.body.user || response.body.usuario
  };
}

/**
 * Helper para login do Administrador usando variáveis de ambiente
 */
export async function loginAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@escola.com';
  const senha = process.env.ADMIN_PASSWORD || 'admin123';
  return await login(email, senha);
}