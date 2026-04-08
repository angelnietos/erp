const fs = require('fs');
const file_path = 'c:/Users/amuni/Desktop/josanz-proyect/josanz-erp/libs/browser/shared/ui-kit/src/lib/ai-assistant/ai-assistant.component.ts';
let content = fs.readFileSync(file_path, 'utf-8');

const toolDefinition = `,
                 {
                    name: 'request_pdf_report',
                    description: 'Pide al bot de reportes que genere un informe en PDF y lo descarga al equipo del usuario. Usalo cuando el usuario pida un informe de la pagina, datos, resumen, etc.',
                    parameters: { 
                      type: 'OBJECT', 
                      properties: { 
                        title: { type: 'STRING', description: 'Titulo del informe.' },
                        subtitle: { type: 'STRING', description: 'Subtitulo opcional.' },
                        lines: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Lineas de texto o conclusiones que el bot debe incluir en el documento (generadas por ti).' },
                        tableHeaders: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Cabeceras de la tabla (opcional).' },
                        tableRows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Datos de la tabla (opcional).' }
                      }, 
                      required: ['title', 'lines'] 
                    }
                 }`;

const targetTool = `                        month: { type: 'NUMBER', description: 'Mes 1-12 (ej: 4).' }\\n                      }, \\n                      required: \\['technicianId', 'year', 'month'\\] \\n                    }\\n                 }`;

// Regex to find the end of auto_plan_availability tool and insert the new one
const replaceToolRegex = /(required: \['technicianId',\s*'year',\s*'month'\]\s*\}\s*\})/;

if (replaceToolRegex.test(content)) {
    content = content.replace(replaceToolRegex, '$1' + toolDefinition);
} else {
    console.log('Could not find tool insertion point');
}

const toolHandle = `
            case 'request_pdf_report':
              try {
                this.messages.update(m => m.map(msg => msg.id === typingId ? { id: typingId, text: \`📄 *Contactando al Bot de Reportes para generar el PDF...*\`, role: 'bot' } : msg));
                
                const table = (args.tableHeaders && args.tableRows) 
                  ? { headers: args.tableHeaders, rows: args.tableRows } 
                  : undefined;

                const response = await firstValueFrom(this.http.post(
                  '/api/reports/export/pdf',
                  {
                    title: args.title,
                    subtitle: args.subtitle,
                    lines: args.lines,
                    table: table
                  },
                  { responseType: 'blob' }
                ));

                // Blob to URL and download
                const url = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`reporte-\${args.title.replace(/\\s+/g, '-').toLowerCase()}.pdf\`;
                a.click();
                window.URL.revokeObjectURL(url);

                responseText = \`✅ ¡He contactado al Bot de Reportes! Tu informe PDF **"\${args.title}"** se ha generado y descargado en tu equipo local.\`;
              } catch (e) {
                console.error(e);
                responseText = \`⚠️ Hubo un error al intentar generar el PDF con el Bot de Reportes.\`;
              }
              break;
`;

const handleRegex = /(case 'auto_plan_availability':[\s\S]*?break;)/;
if (handleRegex.test(content)) {
    content = content.replace(handleRegex, '$1' + toolHandle);
} else {
    console.log('Could not find handle insertion point');
}

fs.writeFileSync(file_path, content, 'utf-8');
console.log('Script completed');
