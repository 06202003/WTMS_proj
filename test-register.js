const http = require('http');

const data = new URLSearchParams();
data.append('tournamentId', '6');
data.append('category', "Men's Doubles");
data.append('club', 'Bandung');
data.append('p1Name', 'Yehezkiel');
data.append('p1Jersey', 'XL');
data.append('p2Name', 'Asep');

const formBoundary = '----WebKitFormBoundaryjYzUtIv6RXriNWN1';
let body = '';
const fields = {
  tournamentId: '6',
  category: "Men's Doubles",
  club: 'Bandung',
  p1Name: 'Yehezkiel',
  p1Jersey: 'XL',
  p1Email: 'test@gmail.com',
  p1Phone: '0812345678',
  p1Profesi: 'Dokter Umum',
  p1Spesialisasi: '',
  p1TempatKerja: 'UKM',
  p1Instagram: '@yz.jsx',
  p2Name: 'Asep',
  p2Jersey: 'XL',
  p2Email: 'asep@gmail.com',
  p2Phone: '0812345678',
  p2Profesi: 'Dokter Umum',
  p2Spesialisasi: '',
  p2TempatKerja: 'UKM',
  p2Instagram: '@test'
};

for (const [key, value] of Object.entries(fields)) {
  body += `--${formBoundary}\r\n`;
  body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
  body += `${value}\r\n`;
}
body += `--${formBoundary}--\r\n`;

fetch('http://localhost:3000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${formBoundary}`,
    'Cookie': 'authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiZnVwVFpXZkR1RDNhUU9kMjRlUXRJVUZJcU1VTjNlc0tUWGFMSEllM1c3NjdhSjRTR0RITkdwYV9RTnZnZVZUMDFfMjh4UVBwc3AzdjY3cVdwdWJZVmcifQ..UrLZE73JKfdmsrYKOB-2XQ.NyElIKcnikjyU60kVVCppzGaWziTsIPciI5rh55KgaIrQghLW5EFpOEICUo_paK3opLndLNQX9WCuOQqb-P-f35Yyrnknl5U4Fp3CadpgiSZuZRn7s2FWuRjZrkwBlOa8t6AfwgbP-GCa1AYY0-iRDnkDfx-aERhCj9C86W0NsAxUFAIV3O-iHpnNnitOY1-wQoi6yR_colg4xXOYhqcZR7YD8CQmcLku-WJ3RJWn-c.P5vErDwrWfwGba8sIWUtR8G7ZKEcPhBtE7HXkWfkgXc'
  },
  body: body
})
.then(res => res.text().then(t => ({ status: res.status, text: t })))
.then(console.log)
.catch(console.error);
