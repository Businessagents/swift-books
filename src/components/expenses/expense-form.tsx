import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { Calculator, Receipt } from "lucide-react"
import { z } from "zod"
import { calculateGSTHST } from "@/lib/tax-calculator"

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  vendor: z.string().optional(),
  expense_date: z.string().min(1, "Date is required"),
  category_id: z.string().optional(),
  tax_code_id: z.string().optional(),
  payment_method: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  is_billable: z.boolean().default(false),
  is_personal: z.boolean().default(false),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expense?: any
  onSuccess: () => void
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const [taxAmount, setTaxAmount] = useState<number>(0)
  const [selectedProvince, setSelectedProvince] = useState<string>("ON")
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      description: expense.description,
      amount: expense.amount,
      vendor: expense.vendor || "",
      expense_date: expense.expense_date,
      category_id: expense.category_id || "",
      tax_code_id: expense.tax_code_id || "",
      payment_method: expense.payment_method || "",
      reference_number: expense.reference_number || "",
      notes: expense.notes || "",
      is_billable: expense.is_billable || false,
      is_personal: expense.is_personal || false,
    } : {
      expense_date: new Date().toISOString().split('T')[0],
      is_billable: false,
      is_personal: false,
    }
  })

  const amount = watch("amount")
  const taxCodeId = watch("tax_code_id")

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Fetch tax codes
  const { data: taxCodes = [] } = useQuery({
    queryKey: ['tax-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Calculate tax when amount or tax code changes
  useEffect(() => {
    if (amount && taxCodeId) {
      const taxCode = taxCodes.find(tc => tc.id === taxCodeId)
      if (taxCode) {
        const calculatedTax = calculateGSTHST(amount, taxCode.province || selectedProvince)
        setTaxAmount(calculatedTax.totalTax)
      }
    } else {
      setTaxAmount(0)
    }
  }, [amount, taxCodeId, taxCodes, selectedProvince])

  // Create/Update expense mutation
  const expenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const expenseData = {
        description: data.description,
        amount: data.amount,
        vendor: data.vendor || null,
        expense_date: data.expense_date,
        category_id: data.category_id || null,
        tax_code_id: data.tax_code_id || null,
        payment_method: data.payment_method || null,
        reference_number: data.reference_number || null,
        notes: data.notes || null,
        is_billable: data.is_billable || false,
        is_personal: data.is_personal || false,
        tax_amount: taxAmount,
        currency: "CAD",
        user_id: user.id,
      }

      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData)
        
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success(expense ? "Expense updated successfully" : "Expense created successfully")
      onSuccess()
    },
    onError: (error) => {
      console.error('Expense error:', error)
      toast.error("Failed to save expense")
    }
  })

  const onSubmit = (data: ExpenseFormData) => {
    expenseMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Expense description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (CAD) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date">Date *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  {...register("expense_date")}
                />
                {errors.expense_date && (
                  <p className="text-sm text-destructive">{errors.expense_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                placeholder="Vendor name"
                {...register("vendor")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select 
                value={watch("category_id") || ""}
                onValueChange={(value) => setValue("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Tax & Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax & Financial Details
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax_code_id">Tax Code</Label>
              <Select 
                value={watch("tax_code_id") || ""}
                onValueChange={(value) => setValue("tax_code_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax code" />
                </SelectTrigger>
                <SelectContent>
                  {taxCodes.map((taxCode) => (
                    <SelectItem key={taxCode.id} value={taxCode.id}>
                      {taxCode.name} ({(taxCode.rate * 100).toFixed(1)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {taxAmount > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Calculated Tax (GST/HST):</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Total with Tax:</span>
                  <span className="font-semibold">${(amount + taxAmount).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={watch("payment_method") || ""}
                onValueChange={(value) => setValue("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                placeholder="Receipt #, Invoice #, etc."
                {...register("reference_number")}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_billable"
                  checked={watch("is_billable")}
                  onCheckedChange={(checked) => setValue("is_billable", checked as boolean)}
                />
                <Label htmlFor="is_billable">Billable to client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_personal"
                  checked={watch("is_personal")}
                  onCheckedChange={(checked) => setValue("is_personal", checked as boolean)}
                />
                <Label htmlFor="is_personal">Personal expense (non-deductible)</Label>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this expense..."
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
        </Button>
      </div>
    </form>
  )
}