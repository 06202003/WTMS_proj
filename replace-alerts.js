const fs = require('fs');
const path = require('path');

function replaceAlerts(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAlerts(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('alert(')) {
        if (!content.includes("import Swal")) {
            // Find the first line after "use client" if it exists, or just prepend
            if (content.includes('"use client";')) {
                content = content.replace('"use client";', '"use client";\nimport Swal from "sweetalert2";');
            } else if (content.includes("'use client';")) {
                content = content.replace("'use client';", "'use client';\nimport Swal from \"sweetalert2\";");
            } else {
                content = 'import Swal from "sweetalert2";\n' + content;
            }
        }
        content = content.replace(/\balert\(/g, 'Swal.fire(');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceAlerts('./src');
