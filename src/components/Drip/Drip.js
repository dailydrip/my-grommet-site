import React from "react";

import Split from "grommet/components/Split";
import Markdown from "grommet/components/Markdown";
import Header from "grommet/components/Header";
import Video from "grommet/components/Video";
import Box from "grommet/components/Box";
import Title from "grommet/components/Title";
import Sidebar from "grommet/components/Sidebar";
import Article from "grommet/components/Article";
import Section from "grommet/components/Section";
import Heading from "grommet/components/Heading";
import Paragraph from "grommet/components/Paragraph";
import Footer from "grommet/components/Footer";
import Logo from "grommet/components/icons/Grommet";

const content = `
# [ Elixir 012.2 ] Adding ExAdmin
> A quick and easy administrative interface for Phoenix apps.

## Project

\`\`\`elixir
  def deps do
    # ...
    {:ex_admin, github: "smpallen99/ex_admin"},
    # ...
  end
\`\`\`

\`\`\`sh
vim config/config.exs
\`\`\`

\`\`\`elixir
# ...
config :ex_admin,
  repo: FirestormWeb.Repo,
  module: FirestormWeb.Web,
  modules: [
    FirestormWeb.ExAdmin.Dashboard,
  ]
# ...
\`\`\`

\`\`\`sh
mix do deps.get, deps.compile
\`\`\`

\`\`\`sh
mix admin.install --no-brunch
# since we're using webpack...
mv web/admin/ lib/firestorm_web/web/
# Needs to be in the right spot...
\`\`\`

\`\`\`sh
vim lib/firestorm_web/web/router.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Web.Router do
  # ...
  use ExAdmin.Router
  # ...
  # setup the ExAdmin routes on /admin
  scope "/admin", ExAdmin do
    pipe_through :browser
    admin_routes()
  end
\`\`\`

Now if we restart and visit <http://localhost:4000/admin>, we see an
administrative interface - but it's pretty boring.

![ExAdmin basic admin interface](https://dailydrip-assets.s3.amazonaws.com/DailyDrip/Elixir/012.2_Adding_ExAdmin/exadmin_just_installed.png)

In theory we can use a generator to add a new resource to the admin, though at
present it wants to put files directly into the \`web\` directory. Let's just
create a new resource file - this is what would have been created by the
installer:

\`\`\`sh
mkdir -p lib/firestorm_web/web/admin/forums
vim lib/firestorm_web/web/admin/forums/category.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.ExAdmin.Forums.Category do
  use ExAdmin.Register

  register_resource FirestormWeb.Forums.Category do
  end
end
\`\`\`

We'll also configure \`ex_admin\` to show this resource, and tell \`ex_admin\` how
to render our \`TitleSlug\` fields.

\`\`\`sh
config :ex_admin,
  repo: FirestormWeb.Repo,
  module: FirestormWeb.Web,
  modules: [
    FirestormWeb.ExAdmin.Dashboard,
    FirestormWeb.ExAdmin.Forums.Category
  ],
  field_type_matching: %{
    FirestormWeb.Forums.Slugs.CategoryTitleSlug.Type => :string,
    FirestormWeb.Forums.Slugs.ThreadTitleSlug.Type => :string
  }
\`\`\`

Now we can list our categories as admins:

![listing categories](https://dailydrip-assets.s3.amazonaws.com/DailyDrip/Elixir/012.2_Adding_ExAdmin/exadmin_list_categories.png)

If we try to create a new one, it won't work yet because ExAdmin is looking for
a \`FirestormWeb.Forums.Category.changeset/1\` function. We'll move this into the
schema and out of the \`Forums\` module for convenience:

\`\`\`sh
vim lib/firestorm_web/forums/forums.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums do
  # ...
  def create_category(attrs \\ %{}) do
    %Category{}
    |> Category.changeset(attrs)
    |> Repo.insert()
  end
  # ...
  def update_category(%Category{} = category, attrs) do
    category
    |> Category.changeset(attrs)
    |> Repo.update()
  end
  # ...
  def change_category(%Category{} = category) do
    Category.changeset(category, %{})
  end
  # ...and move category_changeset function over to the schema file.
end
\`\`\`

\`\`\`sh
vim lib/firestorm_web/forums/category.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums.Category do
  # ...
  import Ecto.Changeset, warn: false
  # ...
  def changeset(%__MODULE__{} = category, attrs \\ %{}) do
    category
    |> cast(attrs, [:title])
    |> validate_required([:title])
    |> CategoryTitleSlug.maybe_generate_slug
    |> CategoryTitleSlug.unique_constraint
  end
end
\`\`\`

![creating a category](https://dailydrip-assets.s3.amazonaws.com/DailyDrip/Elixir/012.2_Adding_ExAdmin/exadmin_new_category.png)

We can do the same thing for the rest of the resources and get a nice looking
admin interface quickly:

\`\`\`sh
vim lib/firestorm_web/web/admin/forums/thread.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.ExAdmin.Forums.Thread do
  use ExAdmin.Register

  register_resource FirestormWeb.Forums.Thread do
  end
end
\`\`\`

\`\`\`sh
vim lib/firestorm_web/web/admin/forums/post.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.ExAdmin.Forums.Post do
  use ExAdmin.Register

  register_resource FirestormWeb.Forums.Post do
  end
end
\`\`\`

\`\`\`sh
vim lib/firestorm_web/forums/forums.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums do
  # ...
  defp new_thread_changeset(%{thread: thread_attrs, post: post_attrs}) do
    # ...
    %Thread{}
    |> Thread.changeset(thread_attrs)
    |> put_assoc(:posts, [post_changeset])
  end
  # ...
  def update_thread(%Thread{} = thread, attrs) do
    thread
    |> Thread.changeset(attrs)
    |> Repo.update()
  end
  # ...
  def change_thread(%Thread{} = thread) do
    thread
    |> Repo.preload(:posts)
    |> Thread.changeset(%{})
    |> put_assoc(:posts, thread.posts)
  end
  # ...
  def create_post(%Thread{} = thread, %User{} = user, attrs) do
    # ...
    changeset = Post.changeset(%Post{}, attrs)
    # ...
  end
  # ...
  def change_post(%Post{} = post) do
    post
    |> Post.changeset(%{})
  end
  # ...
end
\`\`\`

\`\`\`sh
vim lib/firestorm_web/forums/thread.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums.Thread do
  # ...
  import Ecto.Changeset, warn: false
  # ...
  def changeset(%__MODULE__{} = thread, attrs \\ %{}) do
    thread
    |> cast(attrs, [:title, :category_id])
    |> validate_required([:title, :category_id])
    |> ThreadTitleSlug.maybe_generate_slug
    |> ThreadTitleSlug.unique_constraint
  end
end
\`\`\`

\`\`\`sh
vim lib/firestorm_web/forums/post.ex
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums.Post do
  # ...
  import Ecto.Changeset, warn: false
  # ...
  def changeset(%__MODULE__{} = post, attrs \\ %{}) do
    post
    |> cast(attrs, [:body, :thread_id, :user_id])
    |> validate_required([:body, :thread_id, :user_id])
  end
end
\`\`\`

\`\`\`sh
vim config/config.exs
\`\`\`

\`\`\`elixir
config :ex_admin,
  # ...
  modules: [
    FirestormWeb.ExAdmin.Dashboard,
    FirestormWeb.ExAdmin.Forums.Category,
    FirestormWeb.ExAdmin.Forums.Thread,
    FirestormWeb.ExAdmin.Forums.Post
  ],
  # ...
\`\`\`

And now we have the ability to administer threads and posts in the admin as
well. You can also see how nice ExAdmin looks on mobile.

![exadmin mobile screenshots](https://dailydrip-assets.s3.amazonaws.com/DailyDrip/Elixir/012.2_Adding_ExAdmin/exadmin_mobile_screenshots.png)

We can also change the skin color to one of a few different options. We'll try
red:

\`\`\`elixir
config :ex_admin,
  # ...
  skin_color: :red,
  # ...
\`\`\`

![exadmin red skin](https://dailydrip-assets.s3.amazonaws.com/DailyDrip/Elixir/012.2_Adding_ExAdmin/exadmin_skin_red.png)

We can also customize the dashboard. Let's show recent posts for now:

\`\`\`sh
vim lib/firestorm_web/web/admin/dashboard.ex
\`\`\`

\`\`\`elixir

\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums.Role do
  @moduledoc """
  Schema for forum roles.
  """

  use Ecto.Schema

  schema "forums_roles" do
    field :name, :string

    timestamps()
  end
end
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Repo.Migrations.AddRoles do
  use Ecto.Migration

  def change do
    create table(:forums_roles) do
      add :name, :string

      timestamps()
    end
  end
end
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Forums.RoleMembership do
  @moduledoc """
  Schema for forum role memberships.
  """

  use Ecto.Schema
  alias FirestormWeb.Forums.{Role, User}

  schema "forums_role_memberships" do
    belongs_to :role, Role
    belongs_to :user, User

    timestamps()
  end
end
\`\`\`

\`\`\`elixir
defmodule FirestormWeb.Repo.Migrations.AddRoleMemberships do
  use Ecto.Migration

  def change do
    create table(:forums_role_memberships) do
      add :user_id, references(:forums_users)
      add :role_id, references(:forums_roles)

      timestamps()
    end
  end
end
\`\`\`
`;

export default class Drip extends React.PureComponent {
  render() {
    return (
      <Article full={true} pad="none">
        <Header pad="medium">
          <Title>Weekly Drip 021.5</Title>
        </Header>
        <Section pad="none">
          <Video
            src="https://d25pnt1rrtzbdm.cloudfront.net/uploads/drip/video/971/025.1_Weekly_Drip_Optimized.mp4"
            allowFullScreen={true}
            fit="cover"
            title="Weekly Drip 025.1"
          />
        </Section>
        <Section pad="medium">
          <Markdown content={content} />
        </Section>
      </Article>
    );
  }
}
