import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { Send, Bot, MessageSquare } from "lucide-react"

interface PaymentReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
  onSuccess: () => void
}

const reminderTones = [
  { value: "friendly", label: "Friendly", description: "Warm and professional tone" },
  { value: "formal", label: "Formal", description: "Professional business tone" },
  { value: "urgent", label: "Urgent", description: "More direct and assertive" },
]

const reminderTemplates = {
  friendly: `Hi [CLIENT_NAME],

I hope this message finds you well! I wanted to reach out regarding invoice [INVOICE_NUMBER] for $[AMOUNT], which was due on [DUE_DATE].

I understand that things can get busy, so I wanted to send a friendly reminder about this outstanding payment. If you have any questions about the invoice or need to discuss payment arrangements, please don't hesitate to reach out.

Thank you for your continued business, and I look forward to hearing from you soon.

Best regards,
[YOUR_NAME]`,

  formal: `Dear [CLIENT_NAME],

This is a formal reminder regarding the outstanding payment for invoice [INVOICE_NUMBER] in the amount of $[AMOUNT], which was due on [DUE_DATE].

According to our records, this payment remains outstanding. Please remit payment at your earliest convenience to avoid any potential late fees or service interruptions.

If you have already processed this payment, please disregard this notice. If you have any questions or concerns regarding this invoice, please contact us immediately.

Sincerely,
[YOUR_NAME]`,

  urgent: `Dear [CLIENT_NAME],

URGENT: Payment Required for Invoice [INVOICE_NUMBER]

This is an urgent reminder that payment for invoice [INVOICE_NUMBER] in the amount of $[AMOUNT] is now [DAYS_OVERDUE] days overdue.

Immediate payment is required to avoid:
- Late payment fees
- Potential service suspension
- Collection proceedings

Please contact us immediately to resolve this matter.

[YOUR_NAME]`
}

export function PaymentReminderDialog({ open, onOpenChange, invoice, onSuccess }: PaymentReminderDialogProps) {
  const [selectedTone, setSelectedTone] = useState<string>("friendly")
  const [customMessage, setCustomMessage] = useState<string>("")
  const [generatedMessage, setGeneratedMessage] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate AI reminder mutation
  const generateReminderMutation = useMutation({
    mutationFn: async ({ tone, invoice }: { tone: string; invoice: any }) => {
      const { data, error } = await supabase.functions.invoke('generate-payment-reminder', {
        body: {
          invoiceId: invoice.id,
          tone,
          clientName: invoice.client_name,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total_amount,
          dueDate: invoice.due_date,
          daysOverdue: Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 3600 * 24))
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      setGeneratedMessage(data.message)
      toast.success("Reminder message generated successfully")
    },
    onError: (error) => {
      console.error('Generate reminder error:', error)
      toast.error("Failed to generate reminder message")
    }
  })

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async ({ message, invoice }: { message: string; invoice: any }) => {
      const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          invoiceId: invoice.id,
          clientEmail: invoice.client_email,
          clientName: invoice.client_name,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total_amount,
          message,
          tone: selectedTone
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success("Payment reminder sent successfully")
      onSuccess()
    },
    onError: (error) => {
      console.error('Send reminder error:', error)
      toast.error("Failed to send payment reminder")
    }
  })

  const handleGenerateMessage = () => {
    setIsGenerating(true)
    generateReminderMutation.mutate({ tone: selectedTone, invoice })
  }

  const handleUseTemplate = () => {
    const template = reminderTemplates[selectedTone as keyof typeof reminderTemplates]
    const daysOverdue = Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 3600 * 24))
    
    const filledTemplate = template
      .replace(/\[CLIENT_NAME\]/g, invoice.client_name)
      .replace(/\[INVOICE_NUMBER\]/g, invoice.invoice_number)
      .replace(/\[AMOUNT\]/g, invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 }))
      .replace(/\[DUE_DATE\]/g, new Date(invoice.due_date).toLocaleDateString('en-CA'))
      .replace(/\[DAYS_OVERDUE\]/g, daysOverdue.toString())
      .replace(/\[YOUR_NAME\]/g, '[Your Name]')

    setGeneratedMessage(filledTemplate)
  }

  const handleSendReminder = () => {
    const messageToSend = customMessage || generatedMessage
    if (!messageToSend.trim()) {
      toast.error("Please generate or write a reminder message")
      return
    }

    sendReminderMutation.mutate({ message: messageToSend, invoice })
  }

  const daysOverdue = Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 3600 * 24))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{invoice.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString('en-CA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Overdue:</span>
                  <span className="font-medium text-red-600">{daysOverdue} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label>Reminder Tone</Label>
            <Select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} placeholder="Select reminder tone">
              <option value="">Select reminder tone</option>
              {reminderTones.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label} - {tone.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Message Generation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Reminder Message</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseTemplate}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMessage}
                  disabled={generateReminderMutation.isPending}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {generateReminderMutation.isPending ? "Generating..." : "AI Generate"}
                </Button>
              </div>
            </div>

            {generatedMessage && (
              <div className="space-y-2">
                <Label>Generated Message:</Label>
                <Textarea
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Custom Message (optional):</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your own reminder message or edit the generated one above..."
                rows={6}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendReminder}
              disabled={sendReminderMutation.isPending || (!customMessage && !generatedMessage)}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendReminderMutation.isPending ? "Sending..." : "Send Reminder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}