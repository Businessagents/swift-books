import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const EXPENSE_CATEGORIES = [
  { id: '94127d2b-d8fa-4e92-be33-9be90a6bb6ef', name: 'Office Expenses' },
  { id: '3ea80e1d-adff-4589-9363-1f19032babcf', name: 'Professional Fees' },
  { id: '0eb70343-eecd-4c14-bc14-99cb0356cd39', name: 'Travel' },
  { id: '9d113efe-dd33-46de-9f3b-4bf7f4742782', name: 'Meals and Entertainment' },
  { id: '02fcc39a-3786-4ea8-a975-31e92076cbc5', name: 'Advertising' },
  { id: 'a7ffa7e7-d503-43c1-9b12-11b058a6a7e0', name: 'Supplies' },
  { id: 'ca751846-6edd-45a9-9234-63f476daa13a', name: 'Motor Vehicle' },
  { id: '9ed3eba1-3026-477d-a345-ded5d2375499', name: 'Telephone and Utilities' },
  { id: '3b2999f9-2aa9-4601-95ee-5ca5024638d6', name: 'Insurance' },
  { id: 'aca18aa3-6ceb-4f14-88a0-9314925b4082', name: 'Repairs and Maintenance' },
  { id: '77dc57cb-1d30-4f2c-b3ac-fa8fa37baaf9', name: 'Rent' },
  { id: 'a6d768ad-d3a6-4a75-92a0-e2680ad0143a', name: 'Management and Administration' },
  { id: 'd7014f85-2bde-4450-8d50-7830554698e8', name: 'Interest and Bank Charges' },
  { id: '0be9c142-e80f-4837-8fd6-2717b54894e2', name: 'Other Expenses' }
];

interface ExpenseCategorizerProps {
  onExpenseCreated?: (expense: any) => void;
}

export const ExpenseCategorizer = ({ onExpenseCreated }: ExpenseCategorizerProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [confidence, setConfidence] = useState(0);
  const { toast } = useToast();

  const categorizeMutation = useMutation({
    mutationFn: async (expenseDescription: string) => {
      const categoryNames = EXPENSE_CATEGORIES.map(cat => cat.name);
      const { data, error } = await supabase.functions.invoke('ai-business-insights', {
        body: { 
          message: `Categorize this business expense: "${expenseDescription}". Return only the category name from this list: ${categoryNames.join(', ')}`,
          context: "expense_categorization"
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const categoryName = data.response.trim();
      const exactMatch = EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
      
      if (exactMatch) {
        setSuggestedCategory(exactMatch.id);
        setSelectedCategory(exactMatch.id);
        setConfidence(85);
      } else {
        // Try to find closest match
        const lowerResponse = data.response.toLowerCase();
        const match = EXPENSE_CATEGORIES.find(cat => 
          lowerResponse.includes(cat.name.toLowerCase()) || 
          cat.name.toLowerCase().includes(lowerResponse)
        );
        
        if (match) {
          setSuggestedCategory(match.id);
          setSelectedCategory(match.id);
          setConfidence(70);
        } else {
          const otherCategory = EXPENSE_CATEGORIES.find(cat => cat.name === 'Other Expenses');
          if (otherCategory) {
            setSuggestedCategory(otherCategory.id);
            setSelectedCategory(otherCategory.id);
            setConfidence(50);
          }
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Categorization failed",
        description: "Failed to categorize expense. Please select manually.",
        variant: "destructive",
      });
      console.error("Categorization error:", error);
    },
  });

  const saveExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category_id: expenseData.category,
          expense_date: new Date().toISOString().split('T')[0],
          currency: 'CAD',
        })
        .select('*, expense_categories(name)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const categoryName = data.expense_categories?.name || 'Unknown Category';
      toast({
        title: "Expense saved!",
        description: `${categoryName}: $${data.amount} CAD`,
      });
      
      onExpenseCreated?.(data);
      
      // Reset form
      setDescription("");
      setAmount("");
      setSuggestedCategory("");
      setSelectedCategory("");
      setConfidence(0);
    },
    onError: (error) => {
      toast({
        title: "Failed to save expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCategorize = () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter an expense description to categorize.",
        variant: "destructive",
      });
      return;
    }
    
    categorizeMutation.mutate(description);
  };

  const handleSave = () => {
    if (!description.trim() || !amount || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    saveExpenseMutation.mutate({
      description,
      amount,
      category: selectedCategory,
    });
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-success";
    if (conf >= 60) return "text-warning";
    return "text-destructive";
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return CheckCircle;
    if (conf >= 60) return AlertCircle;
    return AlertCircle;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Expense Categorizer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Expense Description</Label>
          <Textarea
            id="description"
            placeholder="e.g., Adobe Creative Cloud subscription, Client lunch at Restaurant XYZ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (CAD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} placeholder="Select category">
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {suggestedCategory && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Suggestion:</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {confidence}% confidence
                </Badge>
                {(() => {
                  const Icon = getConfidenceIcon(confidence);
                  return <Icon className={`h-4 w-4 ${getConfidenceColor(confidence)}`} />;
                })()}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>{EXPENSE_CATEGORIES.find(cat => cat.id === suggestedCategory)?.name || 'Unknown'}</strong>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCategorize}
            disabled={!description.trim() || categorizeMutation.isPending}
            variant="outline"
            className="flex-1"
          >
            {categorizeMutation.isPending ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                Categorizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Categorize with AI
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!description.trim() || !amount || !selectedCategory || saveExpenseMutation.isPending}
            className="flex-1"
          >
            {saveExpenseMutation.isPending ? "Saving..." : "Save Expense"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Be specific in descriptions for better categorization accuracy</p>
          <p>🇨🇦 Categories follow CRA business expense guidelines</p>
        </div>
      </CardContent>
    </Card>
  );
};