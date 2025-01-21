"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface EmployeeData {
  name: string
  employeeId: string
  designation: string
  joiningDate: string
  payPeriod: string
  payDate: string
  netPay: number
  paidDays: number
  lopDays: number
  basic: number
  hra: number
  conveyanceAllowance: number
  fixedAllowance: number
  incomeTax: number
}

const toNumber = (value: string | number): number => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

export default function EmployeePaySlipGenerator() {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    name: "",
    employeeId: "",
    designation: "",
    joiningDate: "",
    payPeriod: "",
    payDate: "",
    netPay: 0,
    paidDays: 31,
    lopDays: 0,
    basic: 0,
    hra: 0,
    conveyanceAllowance: 0,
    fixedAllowance: 0,
    incomeTax: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmployeeData((prev) => ({
      ...prev,
      [name]:
        name === "name" ||
        name === "employeeId" ||
        name === "designation" ||
        name === "joiningDate" ||
        name === "payPeriod" ||
        name === "payDate"
          ? value
          : toNumber(value),
    }))
  }

  const generatePDF = (e: React.FormEvent) => {
    e.preventDefault()

    const doc = new jsPDF()

    // Set colors
    const primaryColor = "#3366cc"
    const secondaryColor = "#f2f2f2"

    // Add company header
    doc.setFillColor(primaryColor)
    doc.rect(0, 0, 210, 40, "F")
    doc.setTextColor("#ffffff")
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("Himotech Global Private Limited", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("B-01, D-84 Sector 2 NOIDA Uttar Pradesh 201301 India", 105, 30, { align: "center" })

    // Add Pay Summary title
    doc.setFillColor(secondaryColor)
    doc.rect(0, 40, 210, 10, "F")
    doc.setTextColor(primaryColor)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Employee Pay Summary", 105, 47, { align: "center" })

    // Add employee details
    doc.setTextColor("#000000")
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Employee Name: ${employeeData.name}`, 15, 60)
    doc.text(`Employee ID: ${employeeData.employeeId}`, 15, 66)
    doc.text(`Designation: ${employeeData.designation}`, 15, 72)
    doc.text(`Date of Joining: ${employeeData.joiningDate}`, 105, 60)
    doc.text(`Pay Period: ${employeeData.payPeriod}`, 105, 66)
    doc.text(`Pay Date: ${employeeData.payDate}`, 105, 72)

    // Add net pay and days info
    doc.setFillColor(primaryColor)
    doc.rect(15, 80, 180, 10, "F")
    doc.setTextColor("#ffffff")
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Employee Net Pay: ₹${toNumber(employeeData.netPay).toFixed(2)}`, 20, 87)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Paid Days: ${toNumber(employeeData.paidDays)} | LOP Days: ${toNumber(employeeData.lopDays)}`, 140, 87)

    // Earnings Table
    const earningsBody = [
      ["Basic", `₹${toNumber(employeeData.basic).toFixed(2)}`, `₹${(toNumber(employeeData.basic) * 7).toFixed(2)}`],
      [
        "House Rent Allowance",
        `₹${toNumber(employeeData.hra).toFixed(2)}`,
        `₹${(toNumber(employeeData.hra) * 7).toFixed(2)}`,
      ],
      [
        "Conveyance Allowance",
        `₹${toNumber(employeeData.conveyanceAllowance).toFixed(2)}`,
        `₹${(toNumber(employeeData.conveyanceAllowance) * 7).toFixed(2)}`,
      ],
      [
        "Fixed Allowance",
        `₹${toNumber(employeeData.fixedAllowance).toFixed(2)}`,
        `₹${(toNumber(employeeData.fixedAllowance) * 7).toFixed(2)}`,
      ],
    ]

    autoTable(doc, {
      head: [["Earnings", "Amount", "YTD"]],
      body: earningsBody,
      startY: 95,
      styles: { fillColor: secondaryColor },
      headStyles: { fillColor: primaryColor, textColor: "#ffffff" },
      alternateRowStyles: { fillColor: "#ffffff" },
    })

    // Deductions Table
    const deductionsBody = [
      [
        "Income Tax",
        `₹${toNumber(employeeData.incomeTax).toFixed(2)}`,
        `₹${(toNumber(employeeData.incomeTax) * 7).toFixed(2)}`,
      ],
    ]

    autoTable(doc, {
      head: [["Deductions", "Amount", "YTD"]],
      body: deductionsBody,
      startY: (doc as any).lastAutoTable.finalY + 10,
      styles: { fillColor: secondaryColor },
      headStyles: { fillColor: primaryColor, textColor: "#ffffff" },
      alternateRowStyles: { fillColor: "#ffffff" },
    })

    const grossEarnings =
      toNumber(employeeData.basic) +
      toNumber(employeeData.hra) +
      toNumber(employeeData.conveyanceAllowance) +
      toNumber(employeeData.fixedAllowance)
    const totalDeductions = toNumber(employeeData.incomeTax)
    const netPayable = grossEarnings - totalDeductions

    // Add summary
    doc.setFillColor(secondaryColor)
    doc.rect(15, (doc as any).lastAutoTable.finalY + 10, 180, 25, "F")
    doc.setTextColor("#000000")
    doc.setFontSize(10)
    doc.text(`Gross Earnings: ₹${grossEarnings.toFixed(2)}`, 20, (doc as any).lastAutoTable.finalY + 20)
    doc.text(`Total Deductions: ₹${totalDeductions.toFixed(2)}`, 105, (doc as any).lastAutoTable.finalY + 20)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Total Net Payable: ₹${netPayable.toFixed(2)}`, 20, (doc as any).lastAutoTable.finalY + 30)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`(Indian Rupee ${numberToWords(netPayable)} Only)`, 105, (doc as any).lastAutoTable.finalY + 30)

    // Add footer
    doc.setFontSize(8)
    doc.text("**Total Net Payable = Gross Earnings - Total Deductions", 15, 280)
    doc.text("-- This is a system generated payslip, hence the signature is not required. --", 15, 285)

    // Save the PDF
    doc.save("employee_pay_slip.pdf")
  }

  // Helper function to convert number to words (unchanged)
  function numberToWords(num: number): string {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if (num < 20) return units[num]

    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "")

    if (num < 1000) return units[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "")

    if (num < 100000)
      return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "")

    if (num < 10000000)
      return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "")

    return (
      numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Employee Pay Slip Generator</h1>
      <form onSubmit={generatePDF} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="name">Employee Name</Label>
          <Input id="name" name="name" value={employeeData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            name="employeeId"
            value={employeeData.employeeId}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            value={employeeData.designation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="joiningDate">Date of Joining</Label>
          <Input
            id="joiningDate"
            name="joiningDate"
            type="date"
            value={employeeData.joiningDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="payPeriod">Pay Period</Label>
          <Input id="payPeriod" name="payPeriod" value={employeeData.payPeriod} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="payDate">Pay Date</Label>
          <Input
            id="payDate"
            name="payDate"
            type="date"
            value={employeeData.payDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="netPay">Net Pay</Label>
          <Input
            id="netPay"
            name="netPay"
            type="number"
            value={employeeData.netPay}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="paidDays">Paid Days</Label>
          <Input
            id="paidDays"
            name="paidDays"
            type="number"
            value={employeeData.paidDays}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="lopDays">LOP Days</Label>
          <Input
            id="lopDays"
            name="lopDays"
            type="number"
            value={employeeData.lopDays}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="basic">Basic</Label>
          <Input
            id="basic"
            name="basic"
            type="number"
            value={employeeData.basic}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="hra">House Rent Allowance</Label>
          <Input id="hra" name="hra" type="number" value={employeeData.hra} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
          <Input
            id="conveyanceAllowance"
            name="conveyanceAllowance"
            type="number"
            value={employeeData.conveyanceAllowance}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="fixedAllowance">Fixed Allowance</Label>
          <Input
            id="fixedAllowance"
            name="fixedAllowance"
            type="number"
            value={employeeData.fixedAllowance}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="incomeTax">Income Tax</Label>
          <Input
            id="incomeTax"
            name="incomeTax"
            type="number"
            value={employeeData.incomeTax}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit">Generate PDF Pay Slip</Button>
      </form>
    </div>
  )
}

