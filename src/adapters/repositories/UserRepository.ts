import { IUserPort } from '../../core/ports/IUserPort';
import { User, UserCreateData, UserUpdateData } from '../../core/entities/User';
import { Pool } from 'pg';

export class UserRepository implements IUserPort {
  constructor(private db: Pool) {}

  async createUser(data: UserCreateData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, picture, google_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.db.query(query, [
      data.email,
      data.name,
      data.picture,
      data.googleId,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.picture !== undefined) {
      fields.push(`picture = $${paramCount++}`);
      values.push(data.picture);
    }
    if (data.googleId !== undefined) {
      fields.push(`google_id = $${paramCount++}`);
      values.push(data.googleId);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await this.db.query(query, values);
    return this.mapToUser(result.rows[0]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      googleId: row.google_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
} 