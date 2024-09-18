# Sala de Juegos construida con Angular y Firebase

## Instalar Angular
```bash
npm i -g @angular/cli
```

## Crear aplicacion
```bash
ng new app
ng new app --skip-tests
ng new app --style=css
ng new app --directory=mi-directorio
ng new app --ssr=false
ng new app --directory=my-app --style=css --ssr=false --skip-tests
```

## Ejecutar Servicio
```bash
ng serve
ng serve --port=4201
ng serve --open
ng serve --configuration=production
ng serve --disable-host-check
```

## Crear Componente
```bash
ng generate component nombre-del-componente --stand-alone=true
ng generate component componentes/nombre-del-componente --stand-alone=true
```

## Compilar aplicación
```bash
ng build
```

## Desplegar aplicacion con Firebase
### Instalar Firebase Cli
```bash
npm i -g firebase-tools
```

### Instalar los paquetes de Firebase para Angular
```bash
npm install @angular/fire firebase
```

### Inicializar proyecto con firebase
```bash
firebase init
```

### Configurar directorio de compilacion
1. Durante la inicialización de Firebase se debe configurar el directorio público con la ruta del proyecto de Angular compilado, por defecto se compila en el directorio dist/nombre-del-proyecto/browser
```
? What do you want to use as your public directory? (public) dist/nombre-proyecto
```

2. Otro metodo es editar el archivo de configuracion de Firebase firebase.json cambiando el directorio publico.
```json
"public": "dist/sala-de-juegos/browser",
```


### Desplegar aplicación con Firebase
```bash
firebase deploy --only hosting
```

## Estilos con Bootstrap
### Instalar los paquetes de Bootstrap para Angular
```bash
ng add @ng-bootstrap/ng-bootstrap
```

### Importacion de Bootstrap en Angular Model
```typescript
import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [NgbPaginationModule, NgbAlertModule],
})
export class YourAppModule {
}
```

### Importación de Bootstrap en Angular Component
```typescript
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgbAlert],
  templateUrl: './product.component.html'
})
export class ProductComponent {
}
```