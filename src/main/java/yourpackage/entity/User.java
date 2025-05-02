@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private String employeeNumber;

    private String status; // PENDING, APPROVED

    private String role; // RESEARCHER, ADMIN

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getter, Setter
}
