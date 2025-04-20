import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Importa HttpErrorResponse para mejor manejo de errores
import { catchError, throwError } from 'rxjs'; // Para manejo de errores con RxJS

interface Account {
  id?: number; // El ID es opcional al crear una nueva cuenta
  name: string;
  balance: number;
}

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {

  accounts: Account[] = [];
  // Objeto para el formulario de nueva cuenta
  newAccount: Account = { name: '', balance: 0 };
  // Objeto para el formulario de edición. Puede ser null si no se está editando.
  selectedAccount: Account | null = null;
  // Controla si el formulario está visible
  showForm: boolean = false;
  // Controla si el formulario está en modo edición
  isEditing: boolean = false;

  // URL base del API del backend.
  // Como antes, 'localhost:3000' se refiere al host desde la perspectiva del navegador.
  private apiUrl = 'http://localhost:3000/api/accounts';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.refreshAccounts(); // Carga las cuentas al iniciar el componente
  }

  // --- Métodos para la Interacción con el API ---

  refreshAccounts(): void {
    console.log('Fetching accounts...');
    this.http.get<Account[]>(this.apiUrl)
      .pipe(
        // Captura cualquier error HTTP
        catchError(this.handleError)
      )
      .subscribe({
        next: (data) => {
          this.accounts = data;
          console.log('Accounts fetched successfully', data);
        },
        error: (error) => {
          // El error ya fue manejado y loggeado por handleError
          console.error('Failed to fetch accounts after handling error.');
          // Opcional: Mostrar un mensaje de error en la UI
        }
      });
  }

  saveAccount(): void {
    // Determina si es una operación de crear o actualizar
    if (this.isEditing && this.selectedAccount && this.selectedAccount.id !== undefined) {
      // Actualizar cuenta existente
      console.log('Updating account:', this.selectedAccount);
      this.http.put<Account>(`${this.apiUrl}/${this.selectedAccount.id}`, this.selectedAccount)
         .pipe(catchError(this.handleError))
        .subscribe({
           next: (updatedAccount) => {
            console.log('Account updated successfully', updatedAccount);
            this.refreshAccounts(); // Recarga la lista
            this.cancelForm(); // Cierra el formulario
          },
          error: (error) => {
             console.error('Failed to update account after handling error.');
             // Opcional: Mostrar mensaje de error
          }
        });
    } else {
      // Crear nueva cuenta
      console.log('Creating new account:', this.newAccount);
      this.http.post<Account>(this.apiUrl, this.newAccount)
         .pipe(catchError(this.handleError))
        .subscribe({
           next: (createdAccount) => {
            console.log('Account created successfully', createdAccount);
            this.refreshAccounts(); // Recarga la lista
            this.cancelForm(); // Cierra el formulario y resetea el objeto newAccount
          },
           error: (error) => {
             console.error('Failed to create account after handling error.');
             // Opcional: Mostrar mensaje de error
           }
        });
    }
  }

  deleteAccount(id: number): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la cuenta con ID ${id}?`)) {
      console.log('Deleting account with ID:', id);
      this.http.delete(`${this.apiUrl}/${id}`)
         .pipe(catchError(this.handleError))
        .subscribe({
           next: () => {
            console.log(`Account with ID ${id} deleted successfully`);
            this.refreshAccounts(); // Recarga la lista
          },
           error: (error) => {
             console.error('Failed to delete account after handling error.');
             // Opcional: Mostrar mensaje de error
           }
        });
    }
  }

  // --- Métodos para el Manejo del Formulario ---

  openAddForm(): void {
    this.newAccount = { name: '', balance: 0 }; // Resetea el objeto para el formulario
    this.selectedAccount = null; // Asegura que no estamos en modo edición
    this.isEditing = false;
    this.showForm = true; // Muestra el formulario
    console.log('Opening add form');
  }

  editAccount(account: Account): void {
    // Crea una copia del objeto para evitar modificar la lista directamente mientras se edita
    this.selectedAccount = { ...account };
    this.newAccount = { name: '', balance: 0 }; // Limpia el objeto newAccount
    this.isEditing = true;
    this.showForm = true; // Muestra el formulario
    console.log('Opening edit form for account', account);
  }

  cancelForm(): void {
    this.showForm = false; // Oculta el formulario
    this.isEditing = false;
    this.selectedAccount = null; // Limpia el objeto de edición
    this.newAccount = { name: '', balance: 0 }; // Resetea el objeto de nueva cuenta
    console.log('Form cancelled');
  }

   // --- Manejo de Errores HTTP ---
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
       if (error.error && typeof error.error === 'string') {
            errorMessage = `Error Code: ${error.status}\nBackend Message: ${error.error}`;
       } else if (error.error && typeof error.error === 'object' && error.error.message) {
            errorMessage = `Error Code: ${error.status}\nBackend Message: ${error.error.message}`;
       }
    }
    console.error('HTTP Error:', errorMessage);
    // Retorna un observable con un mensaje de error para que el suscriptor pueda manejarlo
    return throwError(() => new Error(errorMessage));
  }
}