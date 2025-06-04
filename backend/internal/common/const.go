package common

import "time"

const (
	Zero  = 0
	Empty = ""

	TypeEmail   = "email"
	TypePhone   = "phone"
	KeySet      = "user_id"
	KeyTwoSet   = "user2"
	KeyPage     = "page"
	KeyLimit    = "limit"
	DefaultPage = "1"
	LimitPage   = "50"
	KeyText     = "text"
	TypeMessage = "message"

	PriceSub    = 8000
	PriceSubPro = 30000

	MinLenLogin          = 6
	MinLenPassword       = 8
	MaxDescriptionLength = 500
	MaxTtileLength       = 100

	TimeSession          = 24 * 60 * 60
	TimeDbContext        = 5 * time.Minute
	StandartCookie       = 10 * time.Minute
	SchedulerStopTimeout = time.Minute * 5

	HostPhoto = "/ads-photos/"

	SuccessCode = "Success"

	DoneMessage   = "Пользователь успешно зарегистрировался"
	DoneMessageKz = "Пайдаланушы сәтті тіркелді"

	ErrorCode = "Error"

	EmptyErrorMessage   = "Логин и пароль пусты"
	EmptyErrorMessageKz = "Логин мен пароль бос"

	MatchErrorMessage   = "Логин и пароль совпадают"
	MatchErrorMessageKz = "Логин мен пароль сәйкес келеді"

	LenErrorMessage   = "Логин или пароль короткий"
	LenErrorMessageKz = "Логин немесе пароль қысқа"

	LatinErrorMessage   = "Логин или пароль содержит нелатинские символы"
	LatinErrorMessageKz = "Логин немесе парольде латын емес таңбалар бар"

	EmailErrorMessage   = "Логин Email должен содержать только английские буквы, цифры и допустимые символы"
	EmailErrorMessageKz = "Email логинінде тек ағылшын әріптері, сандар және жарамды таңбалар болуы керек"

	PhoneErrorMessage   = "Номер телефона должен содержать ровно 11 цифр без плюсов, пробелов и скобок"
	PhoneErrorMessageKz = "Телефон нөмірінде плюс, бос орын және жақшасыз дәл 11 сан болуы керек"

	MatchLoginErrorMessage   = "Логин уже зарегистрирован"
	MatchLoginErrorMessageKz = "Логин тіркелді"

	ErrorMessage   = "Неизвестная ошибка, повторите попытку позже"
	ErrorMessageKz = "Белгісіз қате, кейінірек қайталап көріңіз"
)
