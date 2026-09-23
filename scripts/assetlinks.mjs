import {writeFileSync} from 'node:fs';
const [packageName,fingerprint]=process.argv.slice(2);
if(!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(packageName||'')||!/^([0-9a-f]{2}:){31}[0-9a-f]{2}$/i.test(fingerprint||'')){console.error('Uso: node scripts/assetlinks.mjs br.com.bycarolla.atelie AA:BB:... (SHA-256 completo)');process.exit(1);}
writeFileSync('public/.well-known/assetlinks.json',JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'android_app',package_name:packageName,sha256_cert_fingerprints:[fingerprint.toUpperCase()]}}],null,2)+'\n');
console.log('assetlinks.json atualizado. Publique novamente na Vercel.');
