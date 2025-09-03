/**
 * Service for generating PDF reports
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { TastingNote, Tasting } from '@/types/flavor-types'
// import { TemplateQRService } from './template-qr-service'

// Temporary placeholder for QR functionality
class TemplateQRService {
  static async generateTemplateQR(template: any): Promise<string> {
    // Placeholder implementation - returns a simple text QR representation
    return `QR:${template.id}:${template.name}`
  }
}
import { Template } from '@/components/templates'

interface PDFGenerationOptions {
  includeFlavorWheel?: boolean
  includeMetaphors?: boolean
  includeGroupData?: boolean
  customLogo?: string
  customFooter?: string
}

/**
 * Generates a PDF report for a tasting note
 * @param tasting - The tasting data
 * @param tastingNote - The tasting note data
 * @param options - PDF generation options
 * @returns The generated PDF as a Blob
 */
export async function generateTastingPDF(
  tasting: Tasting,
  tastingNote: TastingNote,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add title
  doc.setFontSize(20)
  doc.text(`Tasting Report: ${tasting.name}`, 20, 20)

  // Add date and basic info
  doc.setFontSize(12)
  doc.text(`Date: ${new Date(tasting.date).toLocaleDateString()}`, 20, 30)
  doc.text(`Type: ${tasting.type.charAt(0).toUpperCase() + tasting.type.slice(1)}`, 20, 35)

  // Add item details
  const item = tasting.items.find(i => i.id === tastingNote.itemId)
  if (item) {
    doc.setFontSize(16)
    doc.text(`Item: ${item.name}`, 20, 45)

    if (item.details && !tasting.isBlind) {
      doc.setFontSize(12)
      doc.text(`Details: ${item.details}`, 20, 50)
    }
  }

  // Add tasting notes
  doc.setFontSize(16)
  doc.text('Tasting Notes', 20, 60)

  // Convert notes object to array for table
  const notesArray = Object.entries(tastingNote.notes).map(([key, value]) => {
    return [key, typeof value === 'object' ? JSON.stringify(value) : value.toString()]
  })

  autoTable(doc, {
    startY: 65,
    head: [['Characteristic', 'Notes']],
    body: notesArray,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  })

  // Add extracted descriptors
  if (tastingNote.extractedDescriptors && tastingNote.extractedDescriptors.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 120

    doc.setFontSize(16)
    doc.text('Flavor Descriptors', 20, finalY + 10)

    doc.setFontSize(12)
    const descriptorsText = tastingNote.extractedDescriptors.join(', ')

    // Handle text wrapping for long descriptor lists
    const textLines = doc.splitTextToSize(descriptorsText, 170)
    doc.text(textLines, 20, finalY + 20)
  }

  // Add custom footer if provided
  if (options.customFooter) {
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(options.customFooter, 20, 285)
    }
  }

  // Return the PDF as a blob
  return doc.output('blob')
}

/**
 * Generates a PDF report for a complete tasting with multiple notes
 * @param tasting - The tasting data
 * @param tastingNotes - Array of tasting notes
 * @param options - PDF generation options
 * @returns The generated PDF as a Blob
 */
export async function generateCompleteTastingPDF(
  tasting: Tasting,
  tastingNotes: TastingNote[],
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add title
  doc.setFontSize(20)
  doc.text(`Complete Tasting Report: ${tasting.name}`, 20, 20)

  // Add date and basic info
  doc.setFontSize(12)
  doc.text(`Date: ${new Date(tasting.date).toLocaleDateString()}`, 20, 30)
  doc.text(`Type: ${tasting.type.charAt(0).toUpperCase() + tasting.type.slice(1)}`, 20, 35)
  doc.text(`Participants: ${tasting.participants.length}`, 20, 40)

  // Add tasting overview
  doc.setFontSize(16)
  doc.text('Tasting Overview', 20, 50)

  // Add items table
  const itemsArray = tasting.items.map(item => {
    return [item.name, item.details || '']
  })

  autoTable(doc, {
    startY: 55,
    head: [['Item', 'Details']],
    body: itemsArray,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  })

  // Add individual notes for each item
  let currentY = (doc as any).lastAutoTable.finalY + 10

  for (const item of tasting.items) {
    const itemNotes = tastingNotes.filter(note => note.itemId === item.id)

    if (itemNotes.length === 0) continue

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(16)
    doc.text(`Notes for ${item.name}`, 20, currentY)
    currentY += 10

    for (const note of itemNotes) {
      const participant = tasting.participants.find(p => p.id === note.userId)

      if (!participant) continue

      doc.setFontSize(14)
      doc.text(`${participant.name}'s Notes:`, 20, currentY)
      currentY += 5

      // Convert notes object to array for table
      const notesArray = Object.entries(note.notes).map(([key, value]) => {
        return [key, typeof value === 'object' ? JSON.stringify(value) : value.toString()]
      })

      autoTable(doc, {
        startY: currentY,
        head: [['Characteristic', 'Notes']],
        body: notesArray,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 30 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 10

      // Add extracted descriptors
      if (note.extractedDescriptors && note.extractedDescriptors.length > 0) {
        doc.setFontSize(12)
        doc.text('Descriptors: ' + note.extractedDescriptors.join(', '), 30, currentY)
        currentY += 10
      }

      // Check if we need a new page for the next participant
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }
    }

    // Add some space between items
    currentY += 10

    // Check if we need a new page for the next item
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }
  }

  // Add custom footer if provided
  if (options.customFooter) {
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(options.customFooter, 20, 285)
    }
  }

  // Return the PDF as a blob
  return doc.output('blob')
}

/**
 * Generates a PDF for a template
 * @param template - The template data
 * @param includeQR - Whether to include QR code
 * @returns The generated PDF as a Blob
 */
export async function generateTemplatePDF(
  template: Template,
  includeQR: boolean = true
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.text(`Plantilla: ${template.name}`, 20, yPosition)
  yPosition += 15

  // Template description
  doc.setFontSize(12)
  if (template.description) {
    const splitDescription = doc.splitTextToSize(template.description, 170)
    doc.text(splitDescription, 20, yPosition)
    yPosition += splitDescription.length * 5 + 10
  }

  // Template metadata
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Información de la Plantilla', 20, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const templateInfo = [
    `Dificultad: ${template.difficulty_level}`,
    `Duración: ${template.duration} minutos`,
    `Categoría: ${template.category}`,
    `Número de Muestras: ${template.num_samples}`,
    `Valoración: ${template.average_rating.toFixed(1)} (${template.rating_count} valoraciones)`,
    `Usos: ${template.usage_count}`,
  ]

  templateInfo.forEach(info => {
    doc.text(info, 20, yPosition)
    yPosition += 6
  })

  yPosition += 10

  // Evaluation Criteria
  if (template.evaluation_criteria.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Criterios de Evaluación', 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    template.evaluation_criteria.forEach((criteria: any, index: number) => {
      doc.text(`${index + 1}. ${criteria.name} (${criteria.type})`, 25, yPosition)
      yPosition += 6
      if (criteria.options && criteria.options.length > 0) {
        doc.text(`   Opciones: ${criteria.options.join(', ')}`, 25, yPosition)
        yPosition += 6
      }
    })

    yPosition += 10
  }

  // Mexican Cultural Elements
  if (template.nom_classifications.length > 0 || template.terroir_regions.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Elementos Culturales Mexicanos', 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    if (template.nom_classifications.length > 0) {
      doc.text(`Clasificaciones NOM: ${template.nom_classifications.join(', ')}`, 20, yPosition)
      yPosition += 6
    }
    if (template.terroir_regions.length > 0) {
      doc.text(`Regiones: ${template.terroir_regions.join(', ')}`, 20, yPosition)
      yPosition += 6
    }
    if (template.production_methods.length > 0) {
      doc.text(`Métodos de Producción: ${template.production_methods.join(', ')}`, 20, yPosition)
      yPosition += 6
    }

    yPosition += 10
  }

  // QR Code
  if (includeQR) {
    try {
      const qrCode = await TemplateQRService.generateTemplateQR(template)
      const qrSize = 40

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Código QR para Acceso Rápido', 20, yPosition)
      yPosition += 10

      // Add QR code image
      doc.addImage(qrCode, 'PNG', 20, yPosition, qrSize, qrSize)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Escanea para acceder a la plantilla', 20, yPosition + qrSize + 5)
    } catch (error) {
      console.error('Error adding QR code to PDF:', error)
    }
  }

  // Footer
  doc.setFontSize(8)
  doc.text('Generado por FlavorWheel México', 20, 285)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 150, 285)

  return doc.output('blob')
}
