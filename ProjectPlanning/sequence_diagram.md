
``` mermaid
sequenceDiagram
  actor Aisha Khan
  Participant Frontend
  Participant Backend
  Participant Database

  activate Frontend
  activate Backend
  Frontend ->> Backend: request map
  activate Database
  Backend ->> Database: send query to database, fetch data of trucks
  Database -->> Backend: return data of truck
  Backend ->> Database: update status of truck if needed, get location via api with data
  deactivate Database

  rect rgb(0,255,0)
  Backend -->> Frontent: fetch the map
  deactivate Backend
  Frontend -->> Aisha Khan: show the map
  end

  rect rgb(255,0,0)
  Backend -->> Frontend: unable to fetch data
  Frontend -->> Aisho Khan: output error connection error
  deactivate Frontend
  end
```
  
