from Modules.Service.auth_service import AuthService


def test_validate_username():
    service = AuthService()
    assert service.validate_username("ab") == (False, "username muito curto")
    assert service.validate_username("abc!") == (False, "username deve conter apenas caracteres alfanumericos")
    assert service.validate_username("validUser123") == (True, "username válido")


def test_validate_email_address():
    service = AuthService()
    assert service.validate_email_address("invalid-email") == (False, "email inválido")
    assert service.validate_email_address("valid@example.com") == (True, "email válido")


def test_validate_password():
    service = AuthService()
    assert service.validate_password("short", "short") == (False, "senha muito curta")
    assert service.validate_password("password123", "password123") == (False, "senha deve conter caracteres especiais")
    assert service.validate_password("password123!", "different") == (False, "senhas nao conferem")


def test_register_user():
    service = AuthService()
    assert service.register_user("ab", "password123!", "password123!", "invalid-email") == (False, "Falha ao cadastrar usuário. Verifique se os dados estão corretos.")
    assert service.register_user("validUser123", "password123!", "password123!", "valid@example.com") == (True, "Usuário registrado com sucesso!")

def test_validate_birthdate():
    service = AuthService()
    assert service.validate_birthdate("2008-12-01") == (False, "idade menor que 18 anos")
    assert service.validate_birthdate("invalid-date") == (False, "data de nascimento inválida")
    assert service.validate_birthdate("2000-01-01") == (True, "idade válida")

# Criar um teste para a função authenticate_user
def test_authenticate_user():
    pass 

# Criar teste para a função hash_password
def test_hash_password():
    pass 

# Criar teste para a função verify_password
def test_verify_password():
    pass