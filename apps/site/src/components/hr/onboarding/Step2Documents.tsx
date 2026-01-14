"use client";

import { Icon } from "@iconify/react";
import { Form, Row, Col } from "react-bootstrap";

interface Step2Data {
  dpaeCompleted: boolean;
  dpaeDate: string;
  medicalVisitCompleted: boolean;
  medicalVisitDate: string;
  mutuelleCompleted: boolean;
  mutuelleDate: string;
  bankDetailsProvided: boolean;
  bankDetailsDate: string;
  registerCompleted: boolean;
  registerDate: string;
}

interface Step2DocumentsProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

export default function Step2Documents({ data, onChange }: Step2DocumentsProps) {
  const updateField = (field: keyof Step2Data, value: boolean | string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <h5 className="mb-4">
        <Icon icon="ri:file-list-3-line" className="me-2" />
        Documents Administratifs
      </h5>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="DPAE effectuée"
              checked={data.dpaeCompleted}
              onChange={(e) => updateField('dpaeCompleted', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date DPAE</Form.Label>
            <Form.Control
              type="date"
              value={data.dpaeDate}
              onChange={(e) => updateField('dpaeDate', e.target.value)}
              disabled={!data.dpaeCompleted}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Visite médicale effectuée"
              checked={data.medicalVisitCompleted}
              onChange={(e) => updateField('medicalVisitCompleted', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date visite médicale</Form.Label>
            <Form.Control
              type="date"
              value={data.medicalVisitDate}
              onChange={(e) => updateField('medicalVisitDate', e.target.value)}
              disabled={!data.medicalVisitCompleted}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Mutuelle souscrite"
              checked={data.mutuelleCompleted}
              onChange={(e) => updateField('mutuelleCompleted', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date souscription mutuelle</Form.Label>
            <Form.Control
              type="date"
              value={data.mutuelleDate}
              onChange={(e) => updateField('mutuelleDate', e.target.value)}
              disabled={!data.mutuelleCompleted}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="RIB fourni"
              checked={data.bankDetailsProvided}
              onChange={(e) => updateField('bankDetailsProvided', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date fourniture RIB</Form.Label>
            <Form.Control
              type="date"
              value={data.bankDetailsDate}
              onChange={(e) => updateField('bankDetailsDate', e.target.value)}
              disabled={!data.bankDetailsProvided}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Inscription registre du personnel"
              checked={data.registerCompleted}
              onChange={(e) => updateField('registerCompleted', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date inscription</Form.Label>
            <Form.Control
              type="date"
              value={data.registerDate}
              onChange={(e) => updateField('registerDate', e.target.value)}
              disabled={!data.registerCompleted}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}
