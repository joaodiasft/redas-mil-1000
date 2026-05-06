import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Setup do cliente Supabase para validação de JWT no back-end (Zero Trust)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adiciona as tipagens para estender o Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware para proteger rotas. Verifica se o Bearer token existe e é válido no Supabase Auth.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso negado: Token ausente ou formato inválido.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificando o JWT diretamente pelo Supabase (Garante revogações e validade)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Pendura o usuário validado na request para uso em controllers subsequentes
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao validar token.' });
  }
};
