import { Injectable } from '@angular/core';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportPatientsToWord(patients: any[]): void {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "FICHE PATIENTS - GESTION CLINIQUE",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date d'export: ${new Date().toLocaleDateString('fr-FR')}`,
                italics: true
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Nombre total de patients: ${patients.length}`,
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 400 }
          }),
          ...this.createPatientsTable(patients)
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `patients_${new Date().toISOString().split('T')[0]}.docx`);
    });
  }

  private createPatientsTable(patients: any[]): (Table | Paragraph)[] {
    const elements: (Table | Paragraph)[] = [];
    
    // En-tête de section
    elements.push(
      new Paragraph({
        text: "LISTE DES PATIENTS",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    // Table des patients
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // En-tête du tableau
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "Nom", alignment: AlignmentType.CENTER })],
              shading: { fill: "007bff" }
            }),
            new TableCell({
              children: [new Paragraph({ text: "Prénom", alignment: AlignmentType.CENTER })],
              shading: { fill: "007bff" }
            }),
            new TableCell({
              children: [new Paragraph({ text: "Email", alignment: AlignmentType.CENTER })],
              shading: { fill: "007bff" }
            }),
            new TableCell({
              children: [new Paragraph({ text: "Téléphone", alignment: AlignmentType.CENTER })],
              shading: { fill: "007bff" }
            }),
            new TableCell({
              children: [new Paragraph({ text: "Adresse", alignment: AlignmentType.CENTER })],
              shading: { fill: "007bff" }
            })
          ]
        }),
        // Lignes des patients
        ...patients.map(patient => new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(patient.nom || '')]
            }),
            new TableCell({
              children: [new Paragraph(patient.prenom || '')]
            }),
            new TableCell({
              children: [new Paragraph(patient.email || '')]
            }),
            new TableCell({
              children: [new Paragraph(patient.telephone || '')]
            }),
            new TableCell({
              children: [new Paragraph(this.formatAddress(patient.adresse))]
            })
          ]
        }))
      ]
    });

    elements.push(table);

    // Pied de page
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "© kfokam48 2025 - Gestion Clinique",
            italics: true,
            size: 20
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 }
      })
    );

    return elements;
  }

  private formatAddress(adresse: any): string {
    if (!adresse) return '';
    const parts = [];
    if (adresse.houseNumber) parts.push(adresse.houseNumber);
    if (adresse.street) parts.push(adresse.street);
    if (adresse.city) parts.push(adresse.city);
    if (adresse.postalCode) parts.push(adresse.postalCode.toString());
    if (adresse.country) parts.push(adresse.country);
    return parts.join(', ');
  }
}