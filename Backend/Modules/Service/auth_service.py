from email_validator import validate_email, EmailNotValidError
from datetime import datetime, date
import string


class AuthService:
    def __init__(self):
        pass
    
    def validate_username(self, username:str):
        if len(username) < 3:
            return False,"username muito curto"
        elif any(not char.isalnum() for char in username):
            return False,"username deve conter apenas caracteres alfanumericos"
        else:
            return True,"username válido"
    
    def validate_email_address(self, email:str):
        try:
            validate_email(email, check_deliverability=False)
            return True,"email válido"
        except EmailNotValidError:
            return False,"email inválido"
        
    def validate_password(self, password:str, password_confirm:str):
        if len(password) < 8:
            return False,"senha muito curta"
        elif not any(char in string.punctuation for char in password):
            return False,"senha deve conter caracteres especiais"
        elif password != password_confirm:
            return False,"senhas nao conferem"
        else:
            return True,"senha válida"
    
    def validate_birthdate(self, birthdate:str):
        try:
            birthdate_obj = datetime.strptime(birthdate, "%Y-%m-%d").date()
            today = date.today()
            # Calcula a idade do usuário com base na data de nascimento
            age = today.year - birthdate_obj.year - ((today.month, today.day) < (birthdate_obj.month, birthdate_obj.day)) 
            if age < 18:
                return False,"idade menor que 18 anos"
            else:
                return True,"idade válida"
        except ValueError:
            return False,"data de nascimento inválida"

    def authenticate_user(self, username:str, password:str, email:str):
        # login de usuario
        pass
    
    def register_user(self, username:str, password:str, password_confirm:str, email:str, birthdate:str):
        """Registra um novo usuário no sistema."""
        valido, msg = self.validate_username(username)
        if not valido:
            return False, msg 
        
        valido, msg = self.validate_email_address(email)
        if not valido:
            return False, msg
        
        valido, msg = self.validate_password(password, password_confirm)
        if not valido:
            return False, msg
        
        valido, msg = self.validate_birthdate(birthdate)
        if not valido:
            return False, msg
        
        # Aqui fica a lógica para salvar o usuário no banco de dados
        return True, "Usuário registrado com sucesso!"