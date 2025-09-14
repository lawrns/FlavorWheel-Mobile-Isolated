"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Info } from 'lucide-react'

interface TransparencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransparencyModal({ open, onOpenChange }: TransparencyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle>AI Transparency & Methodology</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] pr-2 overflow-y-auto">
          <div className="space-y-4 text-sm">
            <p className="text-fx-text-secondary">
              This page explains how FlavorWheel derives flavor insights, confidence scores, and suggestions. Our goal is to provide clarity so professionals can evaluate trustworthiness.
            </p>

            <div className="space-y-2">
              <h3 className="font-semibold">Data Inputs</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>User tasting notes (aroma, flavor, other) and selected flavors.</li>
                <li>Historical tastings associated with your account (when available).</li>
                <li>Common flavor relationships curated from public sources and domain knowledge.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Processing Steps</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Normalize input text and tokenize for salient flavor terms.</li>
                <li>Map extracted terms to standardized flavor categories.</li>
                <li>Compute a confidence score based on text evidence and historical frequency.</li>
                <li>Generate a summary and build a hierarchical flavor representation for visualization.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Confidence Scores</h3>
              <p className="text-fx-text-secondary">
                Confidence ranges from 0–1 and is influenced by note specificity, consensus across inputs, and historical consistency. Low confidence indicates the suggestion should be treated as exploratory.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-fx-ai-confidence-low/15 text-fx-ai-confidence-low border-fx-ai-confidence-low/30">Low</Badge>
                <Badge className="bg-fx-accent/10 text-fx-accent border-fx-accent/30">Medium</Badge>
                <Badge className="bg-fx-primary/10 text-fx-primary border-fx-primary/30">High</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Limitations</h3>
              <ul className="list-disc pl-5 space-y-1 text-fx-text-secondary">
                <li>Model suggestions are probabilistic and may surface false positives.</li>
                <li>Confidence does not imply objective truth; human expertise remains essential.</li>
                <li>Small datasets can reduce stability of trends and confidence metrics.</li>
              </ul>
            </div>

            <Alert>
              <AlertDescription className="text-fx-text-secondary">
                We continuously improve the model with user feedback. If a suggestion appears incorrect, feel free to ignore it or submit feedback via support.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 text-fx-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-fx-primary" />
              <span>Professionals can export tasting summaries and share methodology with peers.</span>
            </div>

            <div className="flex items-center gap-2 text-fx-text-muted">
              <Info className="h-4 w-4" />
              <span>No personal data is shared publicly without your consent.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
