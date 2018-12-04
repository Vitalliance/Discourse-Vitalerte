class Incidents
  def initialize(_Tmp)
      _Tmp.each do |tmp|
        switch = tmp.name
        case switch
        when "pkADV"
          @pkADV = tmp.value
        when "nomADV"
          @nomADV = tmp.value
        when "pkCDA"
          @pkCDA = tmp.value
        when "nomCDA"
          @nomCDA = tmp.value
        when "pkDR"
          @pkDR = tmp.value
        when "nomDR"
          @nomDR = tmp.value
        when "pkAgence"
          @pkAgence = tmp.value
        when "nomAgence"
          @nomAgence = tmp.value
      end
    end
  end
    def pkADV
      @pkADV
    end
    def nomADV
      @nomADV
    end
    def pkCDA
      @pkCDA
    end
    def nomCDA
      @nomCDA
    end
    def pkDR
      @pkDR
    end
    def nomDR
      @nomDR
    end
    def pkAgence
      @pkAgence
    end
    def nomAgence
      @nomAgence
    end
end

require_dependency "application_controller"
  class DiscourseStatsVitalerte::NagoraStatsController < ::ApplicationController
    skip_before_action :preload_json, :check_xhr

    def getStatNagora
      _Topics = []
      _TopicsCustomField = []
      _Value = []
      _Tmp = []
      _Incidents = []
      _Categories = []

      _Topics = Topic.find_each
      _TopicsCustomField = TopicCustomField.find_each
      _Categories = Category.find_each

      _Topics.each do |topic|
        _TopicsCustomField.each do |tc|
          if tc.topic_id == topic.id
            if tc.name == "pkADV" || tc.name == "nomADV" || tc.name == "pkCDA" || tc.name == "nomCDA" || tc.name == "pkDR" || tc.name == "nomDR" || tc.name == "pkAgence" || tc.name == "nomAgence"
            _Tmp.push(tc)
            end
          end
        end
        _Value.push(Incidents.new(_Tmp))
        topic = topic.attributes
        topic['nagoraStats'] = _Value
        _Incidents.push(topic)
        _Tmp.clear
        _Value = []
      end
      render json: {incidents: _Incidents, allCategories: _Categories}
    end

    def add_customer
      people = PluginStoreRow.where(plugin_name: "vitalerte")
        .where("key LIKE 'c:%'")
        .where("key != 'c:id'")
  
        id = PluginStore.get("vitalerte", "c:id") || 1
  
        new_people = {
          id: id,
          name: params[:people][:name],
        }

        PluginStore.set("vitalerte", "c:" + id.to_s, new_people)
        PluginStore.set("vitalerte", "c:id", (id.to_i + 1).to_s)

        render json: new_people, root: false
    end

    def add_group
      group = PluginStoreRow.where(plugin_name: "vitalerte")
        .where("key LIKE 'g:%'")
        .where("key != 'g:id'")
  
        id = PluginStore.get("vitalerte", "g:id") || 1
  
        new_group = {
          id: id,
          name: params[:group][:name],
        }

        PluginStore.set("vitalerte", "g:" + id.to_s, new_group)
        PluginStore.set("vitalerte", "g:id", (id.to_i + 1).to_s)

        render json: new_group, root: false
    end

    def get_people_and_group

      usernames_all = User.all.pluck(:username)
      groups_all = Group.all.pluck(:name)

      people = PluginStoreRow.where(plugin_name: "vitalerte")
        .where("key LIKE 'c:%'")
        .where("key != 'c:id'")
      groups = PluginStoreRow.where(plugin_name: "vitalerte")
      .where("key LIKE 'g:%'")
      .where("key != 'g:id'")
      render json: {usernames_all: usernames_all, groups_all: groups_all, usernames: people, groups: groups}
    end

    def delete_people
      people = PluginStoreRow.find_by(:key => "c:" + params[:people_id].to_s)
  
      if people
        people.destroy
        render json: success_json
      else
        render_json_error(page)
      end
    end

    def delete_group
      group = PluginStoreRow.find_by(:key => "g:" + params[:group_id].to_s)
      if group
        group.destroy
        render json: success_json
      else
        render_json_error(page)
      end
    end

    def create
      category = PluginStoreRow.where(plugin_name: "vitalerte")
        .where("key LIKE 'p:%'")
        .where("key != 'p:id'")
  
        id = PluginStore.get("vitalerte", "p:id") || 1
  
        new_category = {
          id: id,
          title: params[:category][:title],
          username: params[:category][:username]
        }
        PluginStore.set("vitalerte", "p:" + id.to_s, new_category)
        PluginStore.set("vitalerte", "p:id", (id.to_i + 1).to_s)
  
        render json: new_category, root: false
    end
  
    def delete
      category = PluginStoreRow.find_by(:key => "p:" + params[:category_id].to_s)
  
      if category
        category.destroy
        render json: success_json
      else
        render_json_error(page)
      end
    end
  
    def get_categories
      username = params[:username]
      concat_string = '\"' + username + '\"}%\''
      categories = PluginStoreRow.where(plugin_name: "vitalerte")
        .where("key LIKE 'p:%'")
        .where("key != 'p:id'")
        .where("value LIKE '%\"username\":" + concat_string)
      render json: {categories: categories}
    end
end