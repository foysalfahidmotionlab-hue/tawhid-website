// Create an admin account or reset an admin's password.
//   npm run admin:create -- owner@example.com "Owner Name"
// The password is typed in (hidden) or read from ADMIN_PASSWORD. Nothing is stored in code.
import { createInterface } from 'node:readline';
import { db } from '../server/db.js';
import { hashPassword, validatePasswordStrength } from '../server/auth.js';

const [email, name = 'Admin'] = process.argv.slice(2);
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Usage: npm run admin:create -- owner@example.com "Owner Name"');
  process.exit(1);
}

function ask(question) {
  return new Promise((done) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : '');
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      done(answer);
    });
  });
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await ask('New password (min 10 chars, letters + numbers): ');
  if ((await ask('Repeat password: ')) !== password) {
    console.error('Passwords do not match.');
    process.exit(1);
  }
}
const weak = validatePasswordStrength(password);
if (weak) {
  console.error(weak);
  process.exit(1);
}

const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email.toLowerCase());
if (existing) {
  db.prepare('UPDATE admin_users SET password_hash = ?, name = ? WHERE id = ?').run(hashPassword(password), name, existing.id);
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(existing.id);
  console.log(`Password reset for ${email}.`);
} else {
  db.prepare('INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)').run(email.toLowerCase(), name, hashPassword(password));
  console.log(`Admin account created for ${email}.`);
}
