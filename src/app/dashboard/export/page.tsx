'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Patient } from '@/lib/types';

type ExportType = 'complete' | 'clinical_notes' | 'treatments' | 'billing' | 'herbal_formulas';

export default function ExportPage() {
  const { practice } = useAppStore();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [exportType, setExportType] = useState<ExportType>('complete');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  async function loadPatients() {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('practice_id', practice!.id)
      .eq('is_active', true)
      .order('last_name');
    setPatients(data || []);
  }

  async function fetchExportData() {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practice_id: practice!.id,
        patient_id: selectedPatient !== 'all' ? selectedPatient : null,
        export_type: exportType,
        start_date: startDate || null,
        end_date: endDate || null,
      }),
    });

    if (!res.ok) throw new Error('Failed to fetch export data');
    return res.json();
  }

  function addHeader(doc: jsPDF, practiceName: string, practiceAddress: string) {
    doc.setFontSize(18);
    doc.setTextColor(212, 165, 116);
    doc.text(practiceName, 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    if (practiceAddress) {
      doc.text(practiceAddress, 14, 27);
    }

    doc.setDrawColor(50, 50, 50);
    doc.line(14, 32, 196, 32);

    return 38;
  }

  function addFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
  }

  function addPatientDemographics(doc: jsPDF, patient: Patient, yPos: number): number {
    let y = yPos;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${patient.first_name} ${patient.last_name}`, 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);

    const fields = [
      ['DOB', patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM d, yyyy') : 'N/A'],
      ['Gender', patient.gender || 'N/A'],
      ['Email', patient.email || 'N/A'],
      ['Phone', patient.phone || 'N/A'],
      ['Address', patient.address || 'N/A'],
      ['Occupation', patient.occupation || 'N/A'],
      ['Emergency Contact', patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || 'N/A'})` : 'N/A'],
      ['Chief Complaint', patient.chief_complaint || 'N/A'],
      ['Medical History', patient.medical_history || 'N/A'],
      ['Medications', patient.medications || 'N/A'],
      ['Allergies', patient.allergies || 'N/A'],
    ];

    fields.forEach(([label, value]) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(120, 120, 120);
      doc.text(`${label}:`, 14, y);
      doc.setTextColor(200, 200, 200);
      const lines = doc.splitTextToSize(String(value), 140);
      doc.text(lines, 60, y);
      y += lines.length * 5 + 2;
    });

    return y + 4;
  }

  async function generatePDF() {
    setGenerating(true);
    try {
      const exportData = await fetchExportData();
      const doc = new jsPDF();

      const practiceName = exportData.practice?.name || practice?.name || 'TCM Practice';
      const practiceAddr = [
        exportData.practice?.address,
        exportData.practice?.city,
        exportData.practice?.state,
        exportData.practice?.zip,
      ]
        .filter(Boolean)
        .join(', ');

      const exportPatients: Patient[] = exportData.patients || [];
      let y = addHeader(doc, practiceName, practiceAddr);

      // Title
      const typeLabels: Record<ExportType, string> = {
        complete: 'Complete Patient Record',
        clinical_notes: 'Clinical Notes',
        treatments: 'Treatment History',
        billing: 'Billing Summary',
        herbal_formulas: 'Herbal Formulas',
      };

      doc.setFontSize(12);
      doc.setTextColor(0, 240, 255);
      doc.text(typeLabels[exportType], 14, y);
      y += 4;

      if (startDate || endDate) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        const rangeText = `Date range: ${startDate || 'Start'} to ${endDate || 'Present'}`;
        doc.text(rangeText, 14, y);
        y += 6;
      }
      y += 4;

      // Patient Demographics
      for (const patient of exportPatients) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        if (exportType === 'complete') {
          y = addPatientDemographics(doc, patient, y);
        } else {
          doc.setFontSize(12);
          doc.setTextColor(212, 165, 116);
          doc.text(`${patient.first_name} ${patient.last_name}`, 14, y);
          y += 8;
        }

        // Clinical Notes
        if (exportType === 'complete' || exportType === 'clinical_notes') {
          const notes = (exportData.clinical_notes || []).filter(
            (n: { patient_id: string }) => n.patient_id === patient.id
          );
          if (notes.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Clinical Notes', 14, y);
            y += 6;

            for (const note of notes) {
              if (y > 240) {
                doc.addPage();
                y = 20;
              }

              doc.setFontSize(9);
              doc.setTextColor(212, 165, 116);
              doc.text(`Visit: ${note.visit_date}${note.is_signed ? ' (Signed)' : ''}`, 14, y);
              y += 5;

              const sections = [
                ['Subjective', note.subjective],
                ['Objective', note.objective],
                ['Assessment', note.assessment],
                ['Plan', note.plan],
                ['Tongue', note.tongue_notes],
                ['Pulse', note.pulse_notes],
                ['Pattern Dx', note.pattern_diagnosis],
              ];

              for (const [label, content] of sections) {
                if (!content) continue;
                if (y > 260) {
                  doc.addPage();
                  y = 20;
                }
                doc.setTextColor(120, 120, 120);
                doc.text(`${label}:`, 18, y);
                doc.setTextColor(200, 200, 200);
                const lines = doc.splitTextToSize(String(content), 130);
                doc.text(lines, 55, y);
                y += lines.length * 4.5 + 2;
              }
              y += 4;
            }
          }
        }

        // Treatment History
        if (exportType === 'complete' || exportType === 'treatments') {
          const treatments = (exportData.treatments || []).filter(
            (t: { patient_id: string }) => t.patient_id === patient.id
          );
          if (treatments.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Treatment History', 14, y);
            y += 6;

            const tableData = treatments.map(
              (t: {
                treatment_date: string;
                acupuncture_points: { point: string }[];
                moxa_applied: boolean;
                cupping_applied: boolean;
                tuina_applied: boolean;
                patient_response: string;
              }) => [
                t.treatment_date,
                (t.acupuncture_points || []).map((p) => p.point).join(', ') || 'N/A',
                [
                  t.moxa_applied && 'Moxa',
                  t.cupping_applied && 'Cupping',
                  t.tuina_applied && 'Tuina',
                ]
                  .filter(Boolean)
                  .join(', ') || 'None',
                t.patient_response || '',
              ]
            );

            autoTable(doc, {
              startY: y,
              head: [['Date', 'Acupuncture Points', 'Modalities', 'Response']],
              body: tableData,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2,
                textColor: [200, 200, 200],
                fillColor: [18, 18, 18],
                lineColor: [42, 42, 42],
                lineWidth: 0.2,
              },
              headStyles: {
                fillColor: [30, 30, 30],
                textColor: [212, 165, 116],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [21, 21, 21],
              },
              margin: { left: 14, right: 14 },
            });

            y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
          }
        }

        // Billing
        if (exportType === 'complete' || exportType === 'billing') {
          const invoices = (exportData.invoices || []).filter(
            (inv: { patient_id: string }) => inv.patient_id === patient.id
          );
          if (invoices.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Billing Summary', 14, y);
            y += 6;

            const tableData = invoices.map(
              (inv: {
                invoice_number: string;
                issue_date: string;
                status: string;
                total: number;
                amount_paid: number;
              }) => [
                inv.invoice_number,
                inv.issue_date,
                inv.status,
                `$${inv.total?.toFixed(2) || '0.00'}`,
                `$${inv.amount_paid?.toFixed(2) || '0.00'}`,
                `$${((inv.total || 0) - (inv.amount_paid || 0)).toFixed(2)}`,
              ]
            );

            autoTable(doc, {
              startY: y,
              head: [['Invoice #', 'Date', 'Status', 'Total', 'Paid', 'Balance']],
              body: tableData,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2,
                textColor: [200, 200, 200],
                fillColor: [18, 18, 18],
                lineColor: [42, 42, 42],
                lineWidth: 0.2,
              },
              headStyles: {
                fillColor: [30, 30, 30],
                textColor: [212, 165, 116],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [21, 21, 21],
              },
              margin: { left: 14, right: 14 },
            });

            y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
          }
        }

        // Herbal Formulas
        if (exportType === 'complete' || exportType === 'herbal_formulas') {
          const formulas = (exportData.herbal_formulas || []).filter(
            (f: { patient_id: string }) => f.patient_id === patient.id
          );
          if (formulas.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Herbal Formulas', 14, y);
            y += 6;

            for (const formula of formulas) {
              if (y > 250) {
                doc.addPage();
                y = 20;
              }

              doc.setFontSize(10);
              doc.setTextColor(212, 165, 116);
              doc.text(
                `${formula.name}${formula.chinese_name ? ` (${formula.chinese_name})` : ''}`,
                14,
                y
              );
              y += 5;

              if (formula.herbs && formula.herbs.length > 0) {
                const herbData = formula.herbs.map(
                  (h: { pin_yin: string; english: string; dosage: number; unit: string; role: string }) => [
                    h.pin_yin,
                    h.english,
                    `${h.dosage}${h.unit}`,
                    h.role,
                  ]
                );

                autoTable(doc, {
                  startY: y,
                  head: [['Pin Yin', 'English', 'Dosage', 'Role']],
                  body: herbData,
                  theme: 'grid',
                  styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    textColor: [200, 200, 200],
                    fillColor: [18, 18, 18],
                    lineColor: [42, 42, 42],
                    lineWidth: 0.2,
                  },
                  headStyles: {
                    fillColor: [30, 30, 30],
                    textColor: [0, 240, 255],
                    fontStyle: 'bold',
                  },
                  alternateRowStyles: {
                    fillColor: [21, 21, 21],
                  },
                  margin: { left: 18, right: 14 },
                });

                y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
              }

              if (formula.dosage_instructions) {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Instructions: ${formula.dosage_instructions}`, 18, y);
                y += 6;
              }
            }
          }
        }

        // Tongue/Pulse for complete export
        if (exportType === 'complete') {
          const tongueAnalyses = exportData.tongue_analyses || [];
          if (tongueAnalyses.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }
            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Tongue Analyses', 14, y);
            y += 6;

            for (const ta of tongueAnalyses) {
              if (y > 255) {
                doc.addPage();
                y = 20;
              }
              doc.setFontSize(9);
              doc.setTextColor(212, 165, 116);
              doc.text(`Date: ${format(new Date(ta.created_at), 'MMM d, yyyy')}`, 14, y);
              y += 5;

              const fields = [
                ['Body Color', ta.body_color],
                ['Body Shape', ta.body_shape],
                ['Coating Color', ta.coating_color],
                ['Coating Thickness', ta.coating_thickness],
                ['Moisture', ta.moisture],
                ['Spirit', ta.spirit],
                ['AI Analysis', ta.ai_analysis],
              ];

              for (const [label, value] of fields) {
                if (!value) continue;
                if (y > 265) {
                  doc.addPage();
                  y = 20;
                }
                doc.setTextColor(120, 120, 120);
                doc.text(`${label}:`, 18, y);
                doc.setTextColor(200, 200, 200);
                const lines = doc.splitTextToSize(String(value), 125);
                doc.text(lines, 60, y);
                y += lines.length * 4 + 2;
              }
              y += 3;
            }
          }

          const pulseDiagnoses = exportData.pulse_diagnoses || [];
          if (pulseDiagnoses.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }
            doc.setFontSize(11);
            doc.setTextColor(0, 240, 255);
            doc.text('Pulse Diagnoses', 14, y);
            y += 6;

            for (const pd of pulseDiagnoses) {
              if (y > 255) {
                doc.addPage();
                y = 20;
              }
              doc.setFontSize(9);
              doc.setTextColor(212, 165, 116);
              doc.text(`Date: ${format(new Date(pd.created_at), 'MMM d, yyyy')}`, 14, y);
              y += 5;

              if (pd.overall_rate) {
                doc.setTextColor(150, 150, 150);
                doc.text(`Overall Rate: ${pd.overall_rate} bpm`, 18, y);
                y += 4;
              }

              const positions = [
                ['Left Cun', pd.left_cun],
                ['Left Guan', pd.left_guan],
                ['Left Chi', pd.left_chi],
                ['Right Cun', pd.right_cun],
                ['Right Guan', pd.right_guan],
                ['Right Chi', pd.right_chi],
              ];

              for (const [label, pos] of positions) {
                if (!pos || !(pos as { qualities?: string[] }).qualities?.length) continue;
                if (y > 265) {
                  doc.addPage();
                  y = 20;
                }
                doc.setTextColor(120, 120, 120);
                doc.text(`${label}:`, 18, y);
                doc.setTextColor(200, 200, 200);
                doc.text((pos as { qualities: string[] }).qualities.join(', '), 55, y);
                y += 4;
              }

              if (pd.overall_notes) {
                doc.setTextColor(150, 150, 150);
                const lines = doc.splitTextToSize(`Notes: ${pd.overall_notes}`, 160);
                doc.text(lines, 18, y);
                y += lines.length * 4 + 2;
              }
              y += 3;
            }
          }
        }

        y += 6;
      }

      addFooter(doc);

      const patientSuffix =
        selectedPatient !== 'all'
          ? `_${exportPatients[0]?.last_name || 'patient'}`
          : '_all-patients';
      const filename = `${practiceName.replace(/\s+/g, '_')}_${exportType}${patientSuffix}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      doc.save(filename);
      toast.success('PDF generated successfully');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  }

  async function generateCSV() {
    setGenerating(true);
    try {
      const exportData = await fetchExportData();
      const invoices = exportData.invoices || [];

      if (invoices.length === 0) {
        toast.error('No billing data to export');
        setGenerating(false);
        return;
      }

      const headers = [
        'Invoice Number',
        'Patient',
        'Issue Date',
        'Due Date',
        'Status',
        'Subtotal',
        'Tax',
        'Discount',
        'Total',
        'Amount Paid',
        'Balance',
      ];

      const patientMap = new Map(
        (exportData.patients || []).map((p: Patient) => [p.id, `${p.first_name} ${p.last_name}`])
      );

      const rows = invoices.map(
        (inv: {
          invoice_number: string;
          patient_id: string;
          issue_date: string;
          due_date: string;
          status: string;
          subtotal: number;
          tax_amount: number;
          discount: number;
          total: number;
          amount_paid: number;
        }) => [
          inv.invoice_number,
          patientMap.get(inv.patient_id) || 'Unknown',
          inv.issue_date,
          inv.due_date,
          inv.status,
          inv.subtotal?.toFixed(2) || '0.00',
          inv.tax_amount?.toFixed(2) || '0.00',
          inv.discount?.toFixed(2) || '0.00',
          inv.total?.toFixed(2) || '0.00',
          inv.amount_paid?.toFixed(2) || '0.00',
          ((inv.total || 0) - (inv.amount_paid || 0)).toFixed(2),
        ]
      );

      const csv = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to generate CSV');
    } finally {
      setGenerating(false);
    }
  }

  const exportTypeOptions: { value: ExportType; label: string; description: string }[] = [
    {
      value: 'complete',
      label: 'Complete Patient Record',
      description: 'Demographics, notes, treatments, diagnoses, formulas, and billing',
    },
    {
      value: 'clinical_notes',
      label: 'Clinical Notes Only',
      description: 'SOAP notes with tongue/pulse findings',
    },
    {
      value: 'treatments',
      label: 'Treatment History',
      description: 'Acupuncture points, modalities, and responses',
    },
    {
      value: 'billing',
      label: 'Billing Summary',
      description: 'Invoices, payments, and balances',
    },
    {
      value: 'herbal_formulas',
      label: 'Herbal Formulas',
      description: 'Prescribed formulas with herb details',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Export Data</h1>
        <p className="text-sm text-gray-400">Generate PDF reports or CSV exports of your practice data</p>
      </div>

      <div className="card max-w-3xl">
        {/* Patient Selector */}
        <div className="mb-6">
          <label className="input-label">Patient</label>
          <select
            className="input-field"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="all">All Patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name}, {p.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Export Type */}
        <div className="mb-6">
          <label className="input-label">Export Type</label>
          <div className="space-y-2 mt-2">
            {exportTypeOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  exportType === opt.value
                    ? 'border-earth-300/50 bg-earth-300/5'
                    : 'border-dark-50 hover:border-dark-50/80 bg-dark-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportType"
                  value={opt.value}
                  checked={exportType === opt.value}
                  onChange={(e) => setExportType(e.target.value as ExportType)}
                  className="mt-1 accent-earth-300"
                />
                <div>
                  <div className="text-sm font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="input-label">Date Range (Optional)</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-50">
          <button
            onClick={generatePDF}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-dark-700/30 border-t-dark-700 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate PDF</>
            )}
          </button>

          {exportType === 'billing' && (
            <button
              onClick={generateCSV}
              disabled={generating}
              className="btn-cyan flex items-center gap-2"
            >
              Export CSV (Billing)
            </button>
          )}

          <button
            onClick={generateCSV}
            disabled={generating}
            className="btn-secondary"
          >
            Export Billing CSV
          </button>
        </div>
      </div>
    </div>
  );
}
