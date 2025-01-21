"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from "jspdf"

interface SlipData {
  name: string
  date: string
  amount: string
  description: string
}

export default function SlipGenerator() {
  const [slipData, setSlipData] = useState<SlipData>({
    name: "",
    date: "",
    amount: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSlipData((prev) => ({ ...prev, [name]: value }))
  }

  const generatePDF = (e: React.FormEvent) => {
    e.preventDefault()

    const doc = new jsPDF()

    // Add content to the PDF
    doc.setFontSize(22)
    doc.text("Slip", 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.text(`Name: ${slipData.name}`, 20, 40)
    doc.text(`Date: ${slipData.date}`, 20, 50)
    doc.text(`Amount: $${slipData.amount}`, 20, 60)
    doc.text(`Description: ${slipData.description}`, 20, 70)

    // Save the PDF
    doc.save("generated_slip.pdf")
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Slip Generator</h1>
      <form onSubmit={generatePDF} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={slipData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" value={slipData.date} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={slipData.amount}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={slipData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit">Generate PDF Slip</Button>
      </form>
    </div>
  )
}

