import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { Plus, Trash2, Calculator, User, FileText } from "lucide-react"
import { z } from "zod"
import { calculateGSTHST } from "@/lib/tax-calculator"

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.number().min(0.01, "Unit price must be greater than 0"),
})

const invoiceSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Valid email is required"),
  client_address: z.string().optional(),
  invoice_number: z.string().min(1, "Invoice number is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  terms: z.string().optional(),
  notes: z.string().optional(),
  payment_instructions: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  invoice?: any
  onSuccess: () => void
}

export function InvoiceForm({ invoice, onSuccess }: InvoiceFormProps) {
  const [taxAmount, setTaxAmount] = useState<number>(0)
  const [subtotal, setSubtotal] = useState<number>(0)
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice ? {
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_address: invoice.client_address || "",
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      terms: invoice.terms || "",
      notes: invoice.notes || "",
      payment_instructions: invoice.payment_instructions || "",
      items: invoice.items || [{ description: "", quantity: 1, unit_price: 0 }],
    } : {
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      items: [{ description: "", quantity: 1, unit_price: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const items = watch("items")

  // Calculate totals when items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.unit_price || 0)
      return sum + lineTotal
    }, 0)

    setSubtotal(newSubtotal)
    
    // Calculate tax (HST for Ontario by default)
    const taxCalculation = calculateGSTHST(newSubtotal, 'ON')
    setTaxAmount(taxCalculation.totalTax)
  }, [items])

  // Generate next invoice number
  useEffect(() => {
    if (!invoice) {
      const generateInvoiceNumber = async () => {
        try {
          const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })

          const nextNumber = (count || 0) + 1
          const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`
          setValue("invoice_number", invoiceNumber)
        } catch (error) {
          console.error('Error generating invoice number:', error)
        }
      }

      generateInvoiceNumber()
    }
  }, [invoice, setValue])

  // Create/Update invoice mutation
  const invoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const invoiceData = {
        client_name: data.client_name,
        client_email: data.client_email,
        client_address: data.client_address || null,
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        terms: data.terms || null,
        notes: data.notes || null,
        payment_instructions: data.payment_instructions || null,
        subtotal,
        tax_amount: taxAmount,
        total_amount: subtotal + taxAmount,
        currency: "CAD",
        status: "draft" as const,
        user_id: user.id,
      }

      let invoiceId: string

      if (invoice) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id)
        
        if (error) throw error
        invoiceId = invoice.id

        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id)
      } else {
        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single()
        
        if (error) throw error
        invoiceId = newInvoice.id
      }

      // Insert items
      const itemsData = data.items.map((item, index) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsData)

      if (itemsError) throw itemsError
    },
    onSuccess: () => {
      toast.success(invoice ? "Invoice updated successfully" : "Invoice created successfully")
      onSuccess()
    },
    onError: (error) => {
      console.error('Invoice error:', error)
      toast.error("Failed to save invoice")
    }
  })

  const onSubmit = (data: InvoiceFormData) => {
    invoiceMutation.mutate(data)
  }

  const addItem = () => {
    append({ description: "", quantity: 1, unit_price: 0 })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                placeholder="Client company or individual name"
                {...register("client_name")}
              />
              {errors.client_name && (
                <p className="text-sm text-destructive">{errors.client_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email *</Label>
              <Input
                id="client_email"
                type="email"
                placeholder="client@company.com"
                {...register("client_email")}
              />
              {errors.client_email && (
                <p className="text-sm text-destructive">{errors.client_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                placeholder="Client billing address"
                rows={3}
                {...register("client_address")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                placeholder="INV-2024-001"
                {...register("invoice_number")}
              />
              {errors.invoice_number && (
                <p className="text-sm text-destructive">{errors.invoice_number.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  {...register("issue_date")}
                />
                {errors.issue_date && (
                  <p className="text-sm text-destructive">{errors.issue_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register("due_date")}
                />
                {errors.due_date && (
                  <p className="text-sm text-destructive">{errors.due_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Input
                id="terms"
                placeholder="Net 30 days"
                {...register("terms")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Invoice Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 md:grid-cols-12 items-end p-4 border rounded-lg">
                <div className="md:col-span-5">
                  <Label htmlFor={`items.${index}.description`}>Description</Label>
                  <Input
                    placeholder="Item description"
                    {...register(`items.${index}.description`)}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`items.${index}.unit_price`}>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.unit_price && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.unit_price?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Line Total</Label>
                  <div className="text-lg font-semibold">
                    ${((items[index]?.quantity || 0) * (items[index]?.unit_price || 0)).toFixed(2)}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>HST (13%):</span>
              <span className="font-semibold">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${(subtotal + taxAmount).toFixed(2)} CAD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_instructions">Payment Instructions</Label>
            <Textarea
              id="payment_instructions"
              placeholder="Payment instructions for the client..."
              rows={2}
              {...register("payment_instructions")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or terms..."
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  )
}