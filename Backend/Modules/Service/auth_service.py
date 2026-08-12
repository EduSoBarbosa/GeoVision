from email_validator import validate_email, EmailNotValidError
from datetime import datetime, date
import string
import bcrypt


class AuthService:
    def __init__(self):
        pass
    
    def validate_username(self, username:str) -> bool:
        if len(username) < 3:
            return False,"username muito curto"
        elif any(not char.isalnum() for char in username):
            return False,"username deve conter apenas caracteres alfanumericos"
        else:
            return True,"username válido"
    
    def validate_email_address(self, email:str) -> bool:
        try:
            validate_email(email, check_deliverability=False)
            return True,"email válido"
        except EmailNotValidError:
            return False,"email inválido"

    def verify_email(self, email:str) -> bool:
        pass  # Aqui você pode implementar a lógica para verificar se o e-mail já está registrado no banco de dados

    def verify_username(self, username:str) -> bool:
        pass  # Aqui você pode implementar a lógica para verificar se o nome de usuário já está registrado no banco de dados

    def hash_password(self, password:str) -> str:
        # Gera um salt aleatório
        salt = bcrypt.gensalt()
        # Cria o hash da senha usando o salt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed_password.decode('utf-8')  # Retorna como string para armazenar no banco de dados


    def verify_password(self, password:str, hashed_password:str) -> bool:
        # Verifica se a senha fornecida corresponde ao hash armazenado
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    def validate_password(self, password:str, password_confirm:str) -> bool:
        if len(password) < 8:
            return False,"senha muito curta"
        elif not any(char in string.punctuation for char in password):
            return False,"senha deve conter caracteres especiais"
        elif password != password_confirm:
            return False,"senhas nao conferem"
        else:
            return True,"senha válida"
    
    def validate_birthdate(self, birthdate:str) -> bool:
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

    def authenticate_user(self, username:str, password:str, email:str) -> bool:
        # login de usuario
        if not self.verify_username(username):
            return False,"username não encontrado"
        if not self.verify_email(email):
            return False,"email não encontrado"
        if not self.verify_password(password, "hashed_password_from_db"):
            return False,"senha incorreta"
        return True,"autenticado com sucesso"
    
    def register_user(self, username:str, password:str, password_confirm:str, email:str, birthdate:str) -> bool:
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