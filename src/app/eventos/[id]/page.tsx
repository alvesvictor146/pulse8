import React from "react";
import { EventoClient } from "./evento-client";

export async function generateStaticParams() {
  return [
    { id: "evt-1" },
    { id: "evt-2" },
    { id: "evt-3" },
    { id: "evt-4" },
    { id: "1" },
  ];
}

interface EventoDetalhesPageProps {
  params: {
    id: string;
  };
}

export default function EventoDetalhesPage({ params }: EventoDetalhesPageProps) {
  return <EventoClient eventId={params.id} />;
}
