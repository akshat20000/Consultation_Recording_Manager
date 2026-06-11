import { IConsultation } from '../models/Consultation';

export class ExportService {
  /**
   * Generates a plain text file representation of a consultation
   */
  static generateTextExport(consultation: any): string {
    const lines: string[] = [];
    lines.push(`CONSULTATION SUMMARY: ${consultation.title.toUpperCase()}`);
    lines.push(`==================================================`);
    lines.push(`Client: ${consultation.clientId?.name || 'N/A'}`);
    lines.push(`Email: ${consultation.clientId?.email || 'N/A'}`);
    lines.push(`Date: ${new Date(consultation.createdAt).toLocaleDateString()}`);
    lines.push(`Duration: ${Math.floor(consultation.duration / 60)}m ${consultation.duration % 60}s`);
    lines.push(`Consent Tracked: Yes (Granted at ${new Date(consultation.consentTimestamp).toLocaleString()})`);
    lines.push(`==================================================\n`);

    if (consultation.notes) {
      lines.push(`PERSONAL NOTES:`);
      lines.push(`---------------`);
      lines.push(`${consultation.notes}\n`);
    }

    if (consultation.summary) {
      lines.push(`AI STRUCTURED INSIGHTS:`);
      lines.push(`-----------------------`);
      lines.push(`Sentiment Label: ${consultation.summary.sentiment}`);
      lines.push(`Keywords: ${consultation.summary.keywords.join(', ')}\n`);

      lines.push(`Key Topics:`);
      consultation.summary.keyTopics.forEach((topic: string) => lines.push(`- ${topic}`));
      lines.push('');

      lines.push(`Recommendations:`);
      consultation.summary.recommendations.forEach((rec: string) => lines.push(`- ${rec}`));
      lines.push('');

      lines.push(`Action Items:`);
      consultation.summary.actionItems.forEach((item: string) => lines.push(`- ${item}`));
      lines.push('');

      lines.push(`Follow-Ups:`);
      consultation.summary.followUps.forEach((item: string) => lines.push(`- ${item}`));
      lines.push('\n');
    }

    if (consultation.transcript) {
      lines.push(`TRANSCRIPT:`);
      lines.push(`-----------`);
      lines.push(consultation.transcript);
    }

    return lines.join('\n');
  }

  /**
   * Generates a markdown file representation of a consultation
   */
  static generateMarkdownExport(consultation: any): string {
    const lines: string[] = [];
    lines.push(`# Consultation: ${consultation.title}`);
    lines.push(`---`);
    lines.push(`- **Client Name**: ${consultation.clientId?.name || 'N/A'}`);
    lines.push(`- **Client Email**: ${consultation.clientId?.email || 'N/A'}`);
    lines.push(`- **Date**: ${new Date(consultation.createdAt).toLocaleDateString()}`);
    lines.push(`- **Duration**: ${Math.floor(consultation.duration / 60)}m ${consultation.duration % 60}s`);
    lines.push(`- **Consent Logged**: Consent granted on ${new Date(consultation.consentTimestamp).toLocaleString()}`);
    lines.push(`- **Tags**: ${consultation.tags.map((t: string) => `\`${t}\``).join(', ') || '*None*'}`);
    lines.push(`---\n`);

    if (consultation.notes) {
      lines.push(`## Astrologer Notes`);
      lines.push(`${consultation.notes}\n`);
    }

    if (consultation.summary) {
      lines.push(`## AI Structured Summary`);
      lines.push(`> **Sentiment Analysis**: ${consultation.summary.sentiment}\n`);
      
      lines.push(`### Key Topics Discussed`);
      consultation.summary.keyTopics.forEach((topic: string) => lines.push(`- ${topic}`));
      lines.push('');

      lines.push(`### Recommendations`);
      consultation.summary.recommendations.forEach((rec: string) => lines.push(`- ${rec}`));
      lines.push('');

      lines.push(`### Action Items`);
      consultation.summary.actionItems.forEach((item: string) => lines.push(`- ${item}`));
      lines.push('');

      lines.push(`### Follow-Ups`);
      consultation.summary.followUps.forEach((item: string) => lines.push(`- ${item}`));
      lines.push('\n');
    }

    if (consultation.transcript) {
      lines.push(`## Full Transcript`);
      lines.push(`\`\`\``);
      lines.push(consultation.transcript);
      lines.push(`\`\`\``);
    }

    return lines.join('\n');
  }
}
