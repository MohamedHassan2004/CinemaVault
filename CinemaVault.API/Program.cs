using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using CinemaVault.Middlewares;
using CinemaVault.DAL.Context;
using CinemaVault.DAL.Models.Users;
using Marketplace.BLL.AutoMapper;
using CinemaVault.BLL.IService;
using CinemaVault.BLL.Service;
using CinemaVault.DAL.Repository;
using CinemaVault.DAL.IRepository;
using Microsoft.AspNetCore.Http.Features;
using CinemaVault.DAL.Enums;


namespace CinemaVault
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<CinemaVaultDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;

                options.User.RequireUniqueEmail = true;

                options.Lockout.MaxFailedAccessAttempts = 3;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(2);
            })
            .AddEntityFrameworkStores<CinemaVaultDbContext>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
                        RoleClaimType = ClaimTypes.Role
                    };
                });

            builder.Services.AddAuthorization(options =>
                options.AddPolicy("CanAddReview", policy =>
                    policy.RequireClaim("Permission", Permissions.AddReviewPermission.ToString())
                    )
                );


            builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

            // services
            builder.Services.AddScoped<IMovieRepository, MovieRepository>();
            builder.Services.AddScoped<IGenreRepository, GenreRepository>();
            builder.Services.AddScoped<IGenreMovieRepository, GenreMovieRepository>();
            builder.Services.AddScoped<ISavedMovieRepository, SavedMovieRepository>();
            builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            builder.Services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();


            builder.Services.AddScoped<IMovieService, MovieService>();
            builder.Services.AddScoped<IGenreService, GenreService>();
            builder.Services.AddScoped<IGenreMovieService, GenreMovieService>();
            builder.Services.AddScoped<ISavedMovieService, SavedMovieService>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserPermissionService, UserPermissionService>();

            builder.Services.AddScoped<IImageStorageService, LocalFileSystemImageStorageService>();
            builder.Services.AddHttpContextAccessor();


            builder.Services.AddControllers();

            // Add CORS policy
            builder.Services.AddCors(options =>
            {   
                options.AddPolicy("AllowAll",
                    builder => builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();


            // seed data in database
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;

                // Role seeding
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                CinemaVaultDbContextSeed.SeedRolesAsync(roleManager).Wait();
            }


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // Use CORS middleware
            app.UseStaticFiles();
            app.UseCors("AllowAll");

            app.UseMiddleware<ExceptionHandlingMiddleware>();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
