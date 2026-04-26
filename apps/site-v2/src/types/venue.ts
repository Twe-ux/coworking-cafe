export interface Venue {
  id: string
  name: string
  city: string
  address: string
  active: boolean
}

export const VENUES: Venue[] = [
  {
    id: "strasbourg",
    name: "CoworKing Café Strasbourg",
    city: "Strasbourg",
    address: "12 rue de la Division Leclerc",
    active: true,
  },
  // Bordeaux à décommenter quand ouvert :
  // { id: "bordeaux", name: "CoworKing Café Bordeaux", city: "Bordeaux", address: "...", active: false },
]
