import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Box,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text
} from "@chakra-ui/react"
import { Label } from "@/components/ui/label"
import { showToast } from "@/lib/toast"
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
      showToast(expense ? "Expense updated successfully" : "Expense created successfully", "success")
      onSuccess()
    },
    onError: (error) => {
      console.error('Expense error:', error)
      showToast("Failed to save expense", "error")
    }
  })

  const onSubmit = (data: ExpenseFormData) => {
    expenseMutation.mutate(data)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        {/* Basic Information */}
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Basic Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="Expense description"
                    {...register("description")}
                  />
                  {errors.description && (
                    <Text fontSize="sm" color="red.500">{errors.description.message}</Text>
                  )}
                </Box>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <Label htmlFor="amount">Amount (CAD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("amount", { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <Text fontSize="sm" color="red.500">{errors.amount.message}</Text>
                    )}
                  </GridItem>
                  <GridItem>
                    <Label htmlFor="expense_date">Date *</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      {...register("expense_date")}
                    />
                    {errors.expense_date && (
                      <Text fontSize="sm" color="red.500">{errors.expense_date.message}</Text>
                    )}
                  </GridItem>
                </Grid>

                <Box>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="Vendor name"
                    {...register("vendor")}
                  />
                </Box>

                <Box>
                  <Label htmlFor="category_id">Category</Label>
                  <Select 
                    placeholder="Select category"
                    value={watch("category_id") || ""}
                    onChange={(e) => setValue("category_id", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Tax & Financial Details */}
        <GridItem>
          <Card>
            <CardHeader>
              <HStack spacing={2}>
                <Calculator size={20} />
                <Heading size="md">Tax & Financial Details</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Label htmlFor="tax_code_id">Tax Code</Label>
                  <Select 
                    placeholder="Select tax code"
                    value={watch("tax_code_id") || ""}
                    onChange={(e) => setValue("tax_code_id", e.target.value)}
                  >
                    <option value="">Select tax code</option>
                    {taxCodes.map((taxCode) => (
                      <option key={taxCode.id} value={taxCode.id}>
                        {taxCode.name} ({(taxCode.rate * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </Select>
                </Box>

                {taxAmount > 0 && (
                  <Box p={3} bg="gray.100" borderRadius="md" _dark={{ bg: "gray.700" }}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">Calculated Tax (GST/HST):</Text>
                      <Text fontWeight="semibold">${taxAmount.toFixed(2)}</Text>
                    </HStack>
                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>Total with Tax:</Text>
                      <Text fontWeight="semibold">${(amount + taxAmount).toFixed(2)}</Text>
                    </HStack>
                  </Box>
                )}

                <Box>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    placeholder="Select payment method"
                    value={watch("payment_method") || ""}
                    onChange={(e) => setValue("payment_method", e.target.value)}
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </Select>
                </Box>

                <Box>
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    placeholder="Receipt #, Invoice #, etc."
                    {...register("reference_number")}
                  />
                </Box>

                <VStack spacing={3} align="start">
                  <Checkbox
                    id="is_billable"
                    isChecked={watch("is_billable")}
                    onChange={(e) => setValue("is_billable", e.target.checked)}
                  >
                    Billable to client
                  </Checkbox>
                  <Checkbox
                    id="is_personal"
                    isChecked={watch("is_personal")}
                    onChange={(e) => setValue("is_personal", e.target.checked)}
                  >
                    Personal expense (non-deductible)
                  </Checkbox>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Notes */}
      <Card mt={6}>
        <CardHeader>
          <Heading size="md">Additional Notes</Heading>
        </CardHeader>
        <CardBody>
          <Box>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this expense..."
              rows={3}
              {...register("notes")}
            />
          </Box>
        </CardBody>
      </Card>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" mt={6}>
        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Saving..."
          colorScheme="blue"
          minW="120px"
        >
          {expense ? "Update Expense" : "Create Expense"}
        </Button>
      </Box>
    </Box>
  )
}