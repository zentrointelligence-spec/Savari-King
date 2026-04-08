import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/images/EbenezerTourTransparentLogo.png';

export const generateInvoicePDF = (booking) => {
  const doc = new jsPDF();

  // Add logo
  doc.addImage(logo, 'PNG', 14, 10, 40, 20);

  // Company details
  doc.setFontSize(10);
  doc.text('Ebenezer Tours & Travels', 14, 40);
  doc.text('123 Travel Street, Cochin, Kerala, India', 14, 45);
  doc.text('Phone: +91 123 456 7890', 14, 50);
  doc.text('Email: contact@ebenezertours.com', 14, 55);

  // Invoice title
  doc.setFontSize(22);
  doc.text('Invoice', 190, 20, { align: 'right' });
  doc.setFontSize(12);
  doc.text(`Invoice #: INV-${booking.id}`, 190, 30, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 37, { align: 'right' });

  // Customer details
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 70);
  doc.setFontSize(10);
  doc.text(booking.user_name, 14, 75);
  doc.text(booking.user_email, 14, 80);

  // Table
  const tableColumn = ["Description", "Details"];
  const tableRows = [];

  tableRows.push(["Tour", booking.tour_name]);
  tableRows.push(["Destination", booking.destination]);
  tableRows.push(["Travel Date", new Date(booking.travel_date).toLocaleDateString()]);
  tableRows.push(["Status", booking.status]);
  tableRows.push(["Number of Persons", booking.number_of_persons]);

  doc.autoTable(tableColumn, tableRows, { startY: 90 });

  // Total
  doc.setFontSize(14);
  doc.text('Total Amount:', 14, doc.autoTable.previous.finalY + 20);
  doc.setFontSize(14);
  doc.text(`₹${booking.total_amount?.toLocaleString('en-IN') || 'N/A'}`, 190, doc.autoTable.previous.finalY + 20, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for choosing Ebenezer Tours & Travels!', 14, 280);

  doc.save(`invoice-${booking.id}.pdf`);
};
