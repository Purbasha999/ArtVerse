export default function ProfileAvatar({ avatar, size = 48, className = '' }) {
    const style = { width: size, height: size, minWidth: size, fontSize: size * 0.5 };

    if (avatar?.url) {
        return (
            <img
                src={avatar.url}
                alt="Profile"
                className={`rounded-circle ${className}`}
                style={{ ...style, objectFit: 'cover' }}
            />
        );
    }

    return (
        <div
            className={`rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center text-secondary ${className}`}
            style={style}
        >
            <i className="bi bi-person-fill"></i>
        </div>
    );
}
